import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

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

    totalVisits = await redis.incr(TOTAL_VISITS_KEY);

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

    return NextResponse.json({ success: true, totalVisits });
  } catch {
    return NextResponse.json({ success: false, totalVisits });
  }
}

export async function GET() {
  try {
    const totalVisits = Number((await redis.get<number>(TOTAL_VISITS_KEY)) ?? 0);
    return NextResponse.json({ success: true, totalVisits });
  } catch {
    return NextResponse.json({ success: false, totalVisits: 0 }, { status: 500 });
  }
}
