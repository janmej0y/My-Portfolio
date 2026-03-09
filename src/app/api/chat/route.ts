import { NextRequest, NextResponse } from "next/server";
import { CASE_STUDIES, CERTIFICATIONS, CONTACT_CARDS, EDUCATION_ITEMS, PROJECTS, SKILL_GROUPS, TRUST_METRICS } from "@/lib/data";

type IncomingMessage = {
  role: "user" | "assistant";
  text: string;
};

function buildPortfolioContext() {
  const projects = PROJECTS.map((p) => `${p.title} [${p.category}] - ${p.shortDescription}. Stack: ${p.tech.join(", ")}`).join("\n");
  const education = EDUCATION_ITEMS.map((e) => `${e.degree} | ${e.institute} | ${e.year} | ${e.score}`).join("\n");
  const skills = SKILL_GROUPS.map((g) => `${g.title}: ${g.items.map((i) => i.name).join(", ")}`).join("\n");
  const certs = CERTIFICATIONS.map((c) => `${c.title} - ${c.description}`).join("\n");
  const cases = CASE_STUDIES.map((c) => `${c.title} (${c.period}) - ${c.summary}`).join("\n");
  const trust = TRUST_METRICS.map((m) => `${m.label}: ${m.value} (${m.note})`).join("\n");
  const contact = CONTACT_CARDS.map((c) => `${c.title}: ${c.value}`).join("\n");

  return `
Owner name: Janmejoy Mahato
Role: Full Stack Developer with cybersecurity focus

Projects:
${projects}

Education:
${education}

Skills:
${skills}

Certifications:
${certs}

Case studies:
${cases}

Trust metrics:
${trust}

Contact:
${contact}

Resume path: /assets/resume.pdf
GitHub: https://github.com/janmej0y
LinkedIn: https://linkedin.com/in/janmej0y
Calendly: https://calendly.com/borj18237/30min
`.trim();
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, message: "Chat service is not configured." }, { status: 500 });
    }

    const body = (await req.json()) as { messages?: IncomingMessage[] };
    const incoming = (body.messages ?? []).slice(-10);

    if (!incoming.length) {
      return NextResponse.json({ success: false, message: "No chat messages provided." }, { status: 400 });
    }

    const context = buildPortfolioContext();
    const messages = [
      {
        role: "system",
        content:
          "You are JanBot, an energetic, witty, playful-argumentative portfolio assistant for Janmejoy Mahato. " +
          "You MUST ONLY answer using Janmejoy's portfolio/resume context below. Never answer unrelated topics. " +
          "If user asks unrelated things (news, politics, random facts, health, coding unrelated to Janmejoy), refuse with a funny one-liner and redirect to Janmejoy's details. " +
          "Style rules: be humorous, roast lightly (never abusive), confident, and slightly argumentative in a friendly debate style. " +
          "Always keep it cheerful and make people smile. Keep replies concise (2-6 sentences). " +
          "No made-up facts. No external facts. No topic drift.",
      },
      {
        role: "system",
        content:
          "Mode: AUTO SARCASM. Be witty, sharp, playful, and confidently roasting by default. " +
          "Keep the humor spicy but never abusive, hateful, sexually explicit, or vulgar. Roast weak questions and bad assumptions, not protected traits or personal identity.",
      },
      {
        role: "system",
        content: `Portfolio context:\n${context}`,
      },
      {
        role: "system",
        content:
          "Argumentative style template: challenge weak assumptions playfully, then provide Janmejoy-focused answer. " +
          "Example tone: 'Nice try, but the real plot twist is...' / 'Respectfully, that's the wrong question...' " +
          "Always end with useful portfolio info (project, skill, education, contact, resume, or case-study detail).",
      },
      ...incoming.map((m) => ({
        role: m.role,
        content: m.text.slice(0, 1200),
      })),
    ];

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        temperature: 0.95,
        max_tokens: 350,
        messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq chat failed:", errorText);
      return NextResponse.json({ success: false, message: "AI chat is temporarily unavailable." }, { status: 502 });
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const reply = data.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return NextResponse.json({ success: false, message: "AI did not return a response." }, { status: 502 });
    }

    return NextResponse.json({ success: true, reply });
  } catch (error) {
    console.error("Chat API failed:", error);
    return NextResponse.json({ success: false, message: "Something went wrong." }, { status: 500 });
  }
}

export function GET() {
  return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
}
