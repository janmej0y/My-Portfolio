let totalVisits = 0; // memory counter (resets on redeploy)

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { ip, page, device, time } = req.body;

  try {
    // Increase total visits
    totalVisits++;

    // Get location
    const geoRes = await fetch(`http://ip-api.com/json/${ip}`);
    const geoData = await geoRes.json();

    const location = `${geoData.city || "Unknown"}, ${geoData.country || ""}`;

    const message = {
      content: `👀 **New Visitor**
      
🌍 IP: ${ip}
📍 Location: ${location}
🖥️ Device: ${device}
📄 Page: ${page}
⏰ Time: ${time}

📊 TOTAL VISITS: **${totalVisits}**`
    };

    await fetch(process.env.DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message)
    });

    res.status(200).json({
      success: true,
      totalVisits
    });

  } catch (error) {
    res.status(500).json({ error: "Tracking failed" });
  }
}
