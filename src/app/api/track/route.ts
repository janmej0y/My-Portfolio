import { NextRequest, NextResponse } from "next/server";
import { getRedis, isRedisConfigured } from "@/lib/redis";

const TOTAL_VISITS_KEY = "portfolio:total_visits";

/** Discord embed colours (decimal). */
const COLOR_VISITOR = 0x22d3ee;
const COLOR_BOT = 0x64748b;
const COLOR_MILESTONE = 0xa78bfa;

/** Crawlers and link-preview fetchers, so real traffic stays easy to spot. */
const BOT_PATTERNS: { re: RegExp; name: string; emoji: string }[] = [
  { re: /googlebot/i, name: "Googlebot", emoji: "🔎" },
  { re: /bingbot/i, name: "Bingbot", emoji: "🔎" },
  { re: /duckduckbot/i, name: "DuckDuckBot", emoji: "🔎" },
  { re: /yandexbot/i, name: "YandexBot", emoji: "🔎" },
  { re: /baiduspider/i, name: "Baidu Spider", emoji: "🔎" },
  { re: /slackbot/i, name: "Slack preview", emoji: "🔗" },
  { re: /discordbot/i, name: "Discord preview", emoji: "🔗" },
  { re: /twitterbot/i, name: "Twitter preview", emoji: "🔗" },
  { re: /facebookexternalhit|facebot/i, name: "Facebook preview", emoji: "🔗" },
  { re: /linkedinbot/i, name: "LinkedIn preview", emoji: "🔗" },
  { re: /whatsapp/i, name: "WhatsApp preview", emoji: "🔗" },
  { re: /telegrambot/i, name: "Telegram preview", emoji: "🔗" },
  { re: /lighthouse|pagespeed|gtmetrix/i, name: "Monitoring", emoji: "📈" },
  { re: /bot|crawler|spider|crawl|headless/i, name: "Unknown bot", emoji: "🤖" },
];

/** Pull a readable browser, OS and form factor out of a user-agent string. */
function parseAgent(ua: string) {
  const bot = BOT_PATTERNS.find((entry) => entry.re.test(ua));
  if (bot) {
    return { isBot: true, browser: bot.name, os: "Crawler", device: "Bot", emoji: bot.emoji };
  }

  // Order matters: Edge and Opera both claim Chrome, and Chrome claims Safari.
  const browser = /edg\//i.test(ua)
    ? "Edge"
    : /opr\/|opera/i.test(ua)
      ? "Opera"
      : /samsungbrowser/i.test(ua)
        ? "Samsung Internet"
        : /firefox\//i.test(ua)
          ? "Firefox"
          : /chrome\//i.test(ua)
            ? "Chrome"
            : /safari\//i.test(ua)
              ? "Safari"
              : "Unknown";

  const os = /windows/i.test(ua)
    ? "Windows"
    : /android/i.test(ua)
      ? "Android"
      : /iphone|ipad|ipod/i.test(ua)
        ? "iOS"
        : /mac os x/i.test(ua)
          ? "macOS"
          : /linux/i.test(ua)
            ? "Linux"
            : "Unknown";

  const tablet = /ipad|tablet/i.test(ua);
  const mobile = !tablet && /mobile|android|iphone/i.test(ua);
  const device = tablet ? "Tablet" : mobile ? "Mobile" : "Desktop";
  const emoji = tablet ? "📟" : mobile ? "📱" : "💻";

  return { isBot: false, browser, os, device, emoji };
}

/** Regional indicator pair, e.g. "IN" renders as the India flag. */
function flagOf(code?: string) {
  if (!code || code.length !== 2) return "🏳️";
  return String.fromCodePoint(
    ...code
      .toUpperCase()
      .split("")
      .map((c) => 0x1f1e6 + c.charCodeAt(0) - 65),
  );
}

/** Friendly name for the path that was opened. */
function pageLabel(path: string) {
  if (!path || path === "/") return "Home";
  return path
    .replace(/^\//, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function POST(req: NextRequest) {
  let totalVisits = 0;

  try {
    const body = await req.json().catch(() => ({}));
    const { page = "/", device = "Unknown", time } = body ?? {};

    // Fall back to now if the client sent nothing usable - an invalid date
    // would serialise as NaN and Discord rejects the whole payload.
    const parsedTime = new Date(time ?? Date.now());
    const seenAt = Number.isNaN(parsedTime.getTime()) ? new Date() : parsedTime;

    const headerIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const ip = headerIp || req.headers.get("x-real-ip") || "Unknown";

    const redis = getRedis();
    if (redis) {
      totalVisits = await redis.incr(TOTAL_VISITS_KEY);
    }

    let city = "";
    let country = "";
    let countryCode = "";
    let region = "";
    let isp = "";
    try {
      const geoRes = await fetch(
        `http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city,isp`,
      );
      const geo = await geoRes.json();
      if (geo?.status === "success") {
        city = geo.city ?? "";
        country = geo.country ?? "";
        countryCode = geo.countryCode ?? "";
        region = geo.regionName ?? "";
        isp = geo.isp ?? "";
      }
    } catch {
      /* geo is best-effort; the visit still gets reported without it */
    }

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (webhookUrl) {
      const agent = parseAgent(String(device));
      const flag = flagOf(countryCode);
      const place = [city, region, country].filter(Boolean).join(", ") || "Unknown location";

      // Every 100th visit is worth calling out.
      const milestone = totalVisits > 0 && totalVisits % 100 === 0;

      const color = milestone ? COLOR_MILESTONE : agent.isBot ? COLOR_BOT : COLOR_VISITOR;
      const title = milestone
        ? `🎉 Visit #${totalVisits.toLocaleString()}`
        : agent.isBot
          ? `${agent.emoji} ${agent.browser}`
          : "✨ New Visitor";

      const embed = {
        title,
        color,
        description: agent.isBot
          ? "_Automated request — not a real visitor._"
          : `${flag} Someone just opened **${pageLabel(String(page))}**`,
        fields: [
          {
            name: "📍 Location",
            value: `${flag} ${place}`,
            inline: true,
          },
          {
            name: `${agent.emoji} Device`,
            value: `${agent.device} · ${agent.os}`,
            inline: true,
          },
          {
            name: "🌐 Browser",
            value: agent.browser,
            inline: true,
          },
          {
            name: "📄 Page",
            value: `\`${String(page)}\``,
            inline: true,
          },
          {
            name: "🕒 Seen",
            // Discord renders this as relative time in the reader's own zone.
            value: `<t:${Math.floor(seenAt.getTime() / 1000)}:R>`,
            inline: true,
          },
          {
            name: "📊 Total Visits",
            value: `**${totalVisits.toLocaleString()}**`,
            inline: true,
          },
        ],
        footer: {
          text: [`IP ${ip}`, isp].filter(Boolean).join("  •  "),
        },
        timestamp: seenAt.toISOString(),
      };

      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "Portfolio Hook",
          embeds: [embed],
        }),
      });
    }

    return NextResponse.json({ success: true, totalVisits, redisConfigured: isRedisConfigured() });
  } catch {
    return NextResponse.json({ success: false, totalVisits, redisConfigured: isRedisConfigured() });
  }
}

export async function GET() {
  try {
    const redis = getRedis();
    const totalVisits = redis ? Number((await redis.get<number>(TOTAL_VISITS_KEY)) ?? 0) : 0;
    return NextResponse.json({ success: true, totalVisits, redisConfigured: isRedisConfigured() });
  } catch {
    return NextResponse.json({ success: false, totalVisits: 0, redisConfigured: isRedisConfigured() }, { status: 500 });
  }
}
