import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

type ContactPayload = {
  name?: string;
  email?: string;
  message?: string;
  company?: string;
};

const recentRequests = new Map<string, number>();
const WINDOW_MS = 60_000;

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const now = Date.now();
    const previous = recentRequests.get(ip) ?? 0;

    if (now - previous < WINDOW_MS) {
      return NextResponse.json(
        { success: false, message: "Too many requests. Please wait a minute." },
        { status: 429 },
      );
    }
    recentRequests.set(ip, now);

    const body = (await req.json()) as ContactPayload;
    const name = body.name?.trim() ?? "";
    const email = body.email?.trim() ?? "";
    const message = body.message?.trim() ?? "";
    const company = body.company?.trim() ?? "";

    // Honeypot field: bots usually fill hidden inputs.
    if (company) {
      return NextResponse.json({ success: true, message: "Message submitted." });
    }

    if (name.length < 2 || name.length > 80) {
      return NextResponse.json({ success: false, message: "Please provide a valid name." }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ success: false, message: "Please provide a valid email." }, { status: 400 });
    }
    if (message.length < 10 || message.length > 2500) {
      return NextResponse.json(
        { success: false, message: "Message should be between 10 and 2500 characters." },
        { status: 400 },
      );
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const resendFromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
    const contactToEmail = process.env.CONTACT_TO_EMAIL || "janmejoymahato529@gmail.com";

    if (!resendApiKey) {
      return NextResponse.json(
        { success: false, message: "Contact service is not configured. Please try again later." },
        { status: 500 },
      );
    }

    const resend = new Resend(resendApiKey);
    const { error } = await resend.emails.send({
      from: resendFromEmail,
      to: [contactToEmail],
      subject: `Portfolio Contact: ${name}`,
      text: `New portfolio contact message\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      replyTo: email,
    });

    if (error) {
      console.error("Resend email delivery failed:", error);
      return NextResponse.json(
        {
          success: false,
          message:
            "Email delivery failed. Verify RESEND_FROM_EMAIL uses a verified sender/domain in Resend, then try again.",
        },
        { status: 502 },
      );
    }

    const webhookUrl = process.env.CONTACT_WEBHOOK_URL || process.env.DISCORD_WEBHOOK_URL;
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `New Portfolio Contact\nName: ${name}\nEmail: ${email}\nMessage: ${message}\nDelivered via: Resend`,
        }),
      });
    }

    return NextResponse.json({ success: true, message: "Message sent successfully." });
  } catch (error) {
    console.error("Contact API failed:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}

export function GET() {
  return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
}
