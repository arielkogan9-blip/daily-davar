import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { rateLimit, getIP } from "@/lib/ratelimit";

export async function POST(req: Request) {
  if (!rateLimit(`feedback:${getIP(req)}`, 5, 60_000)) {
    return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
  }

  try {
    const { message } = await req.json() as { message?: string };

    if (!message?.trim()) {
      return NextResponse.json({ error: "No message provided." }, { status: 400 });
    }

    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASS;

    if (!user || !pass || pass === "your_app_password_here") {
      // Graceful degradation: log locally if credentials aren't configured yet
      console.log("[Feedback]", message.trim());
      return NextResponse.json({ ok: true, note: "logged" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: `"Daily Davar Feedback" <${user}>`,
      to: "dailydavar1@gmail.com",
      subject: "Daily Davar — New Feedback",
      text: message.trim(),
      html: `
        <div style="font-family:Georgia,serif;max-width:560px;padding:24px;background:#FAF5EC;border-radius:8px;">
          <h2 style="color:#18285A;margin-top:0;">Daily Davar Feedback</h2>
          <p style="white-space:pre-wrap;color:#1A1510;line-height:1.7;">${message.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>")}</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/feedback] error:", err);
    return NextResponse.json({ error: "Failed to send." }, { status: 500 });
  }
}
