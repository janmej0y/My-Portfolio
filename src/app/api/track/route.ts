import { NextRequest, NextResponse } from "next/server";
import { getRedis, isRedisConfigured } from "@/lib/redis";

const TOTAL_VISITS_KEY = "portfolio:total_visits";

export async function POST(req: NextRequest) {
  let totalVisits = 0;

  try {
    const body = await req.json().catch(() => ({}));
    const {
      page = "Unknown",
      device = "Unknown",
      time = new Date().toISOString(),
    } = body ?? {};

    const headerIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const ip = headerIp || req.headers.get("x-real-ip") || "Unknown";

    const redis = getRedis();
    if (redis) {
      totalVisits = await redis.incr(TOTAL_VISITS_KEY);
    }

    let location = "Unknown";
    try {
      const geoRes = await fetch(`http://ip-api.com/json/${ip}`);
      const geoData = await geoRes.json();
      location = `${geoData.city || "Unknown"}, ${geoData.country || ""}`.trim();
    } catch {
      location = "Unknown";
    }

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (webhookUrl) {
      const message = {
        content: `New Visitor\nIP: ${ip}\nLocation: ${location}\nDevice: ${device}\nPage: ${page}\nTime: ${time}\nTOTAL VISITS: ${totalVisits}`,
      };

      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message),
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
