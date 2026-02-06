import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { ip, page, device, time } = req.body;

  try {
    // 🔥 This increments permanently in database
    const totalVisits = await redis.incr("portfolio:total_visits");

    const message = {
      content: `👀 **New Visitor**
      
🌍 IP: ${ip}
🖥 Device: ${device}
📄 Page: ${page}
⏰ Time: ${time}

📊 TOTAL VISITS (Since Launch): **${totalVisits}**`
    };

    await fetch(process.env.DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message)
    });

    res.status(200).json({ totalVisits });

  } catch (error) {
    res.status(500).json({ error: "Tracking failed" });
  }
}
