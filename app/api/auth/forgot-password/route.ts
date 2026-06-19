import { NextResponse } from "next/server";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";
import { rateLimit, getIP } from "@/lib/ratelimit";

export async function POST(req: Request) {
  if (!rateLimit(`forgot-pw:${getIP(req)}`, 3, 300_000)) {
    return NextResponse.json({ ok: true }); // silent to prevent enumeration
  }

  try {
    const { email } = await req.json() as { email?: string };
    if (!email?.trim()) return NextResponse.json({ ok: true });

    const normalised = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: normalised } });

    // Always return ok to prevent email enumeration
    if (!user) return NextResponse.json({ ok: true });

    // Invalidate any existing tokens for this user
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL ?? "https://daily-davar.vercel.app"}/reset-password?token=${token}`;

    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASS;

    if (gmailUser && gmailPass && gmailPass !== "your_app_password_here") {
      const transporter = nodemailer.createTransport({ service: "gmail", auth: { user: gmailUser, pass: gmailPass } });
      await transporter.sendMail({
        from: `"Daily Davar" <${gmailUser}>`,
        to: normalised,
        subject: "Reset your Daily Davar password",
        html: `
          <div style="font-family:Georgia,serif;max-width:520px;padding:32px;background:#FAF5EC;border-radius:12px;margin:0 auto;">
            <h2 style="color:#18285A;margin-top:0;">Password Reset</h2>
            <p style="color:#4A3F2F;line-height:1.7;">
              We received a request to reset the password for your Daily Davar account.
              Click the button below to set a new password. This link expires in 1 hour.
            </p>
            <div style="text-align:center;margin:28px 0;">
              <a href="${resetUrl}" style="background:#18285A;color:#F0DFA8;padding:14px 28px;border-radius:8px;text-decoration:none;font-size:16px;font-weight:600;">
                Reset Password →
              </a>
            </div>
            <p style="color:#8C7B65;font-size:12px;line-height:1.6;margin:0;">
              If you didn't request this, you can safely ignore this email. Your password won't change.
            </p>
          </div>
        `,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/auth/forgot-password]", err);
    return NextResponse.json({ ok: true }); // silent
  }
}
