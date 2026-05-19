import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, suggestion } = await req.json() as {
      email?: string;
      suggestion?: string;
    };

    if (!suggestion?.trim())
      return NextResponse.json({ error: "Suggestion text is required." }, { status: 400 });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const normalised = (email ?? "").toLowerCase().trim();
    if (normalised && !emailRegex.test(normalised))
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });

    // Save to database
    await prisma.suggestion.create({
      data: {
        email:      normalised || "anonymous",
        suggestion: suggestion.trim(),
      },
    });

    // Send email notification
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASS;

    if (gmailUser && gmailPass) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: gmailUser, pass: gmailPass },
      });

      await transporter.sendMail({
        from: `"Daily Davar" <${gmailUser}>`,
        to: gmailUser,
        subject: "Daily Davar — New Topic Suggestion",
        text: `Suggestion: ${suggestion.trim()}\n\nFrom: ${normalised || "anonymous"}`,
        html: `
          <div style="font-family:Georgia,serif;max-width:560px;padding:24px;background:#FAF5EC;border-radius:8px;">
            <h2 style="color:#18285A;margin-top:0;">New Topic Suggestion</h2>
            <p style="white-space:pre-wrap;color:#1A1510;line-height:1.7;">${suggestion.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>")}</p>
            <hr style="border:none;border-top:1px solid #E2D8C2;margin:16px 0;">
            <p style="color:#6B5F48;font-size:13px;">From: ${normalised || "anonymous"}</p>
          </div>
        `,
      });
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("[/api/digest/suggest]", err);
    return NextResponse.json({ error: "Failed to save suggestion." }, { status: 500 });
  }
}
