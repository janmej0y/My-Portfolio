export default async function handler(req, res) {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method Not Allowed" });
    }
  
    const { ip, page, device, time } = req.body;
  
    try {
      await fetch(process.env.DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `👀 **New Visitor**
  IP: ${ip}
  Page: ${page}
  Device: ${device}
  Time: ${time}`
        })
      });
  
      return res.status(200).json({ success: true });
  
    } catch (error) {
      return res.status(500).json({ error: "Failed to send" });
    }
  }
  