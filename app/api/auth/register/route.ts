import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json() as {
      name?: string;
      email?: string;
      password?: string;
    };

    // ── Validation ──────────────────────────────────────────────────────────
    if (!email?.trim())    return NextResponse.json({ error: "Email is required."    }, { status: 400 });
    if (!password?.trim()) return NextResponse.json({ error: "Password is required." }, { status: 400 });
    if (password.length < 6)
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });

    const normalised = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalised))
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });

    // ── Duplicate check ──────────────────────────────────────────────────────
    const existing = await prisma.user.findUnique({ where: { email: normalised } });
    if (existing) return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });

    // ── Create user + streak row atomically ──────────────────────────────────
    const hashed = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name:     name?.trim() || null,
        email:    normalised,
        password: hashed,
        tier:     "free",
        streak: {
          create: { currentStreak: 0, longestStreak: 0 },
        },
      },
      select: { id: true, name: true, email: true, tier: true, createdAt: true },
    });

    // Fire-and-forget welcome email
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASS;
    if (gmailUser && gmailPass && gmailPass !== "your_app_password_here") {
      nodemailer.createTransport({ service: "gmail", auth: { user: gmailUser, pass: gmailPass } })
        .sendMail({
          from: `"Daily Davar" <${gmailUser}>`,
          to: normalised,
          subject: "Welcome to Daily Davar 📜",
          html: `
            <div style="font-family:Georgia,serif;max-width:560px;padding:32px;background:#FAF5EC;border-radius:12px;margin:0 auto;">
              <div style="text-align:center;margin-bottom:24px;">
                <div style="font-size:48px;">📜</div>
                <h1 style="color:#18285A;font-size:28px;margin:8px 0 4px;">Welcome to Daily Davar</h1>
                <div style="color:#B8891E;font-size:22px;letter-spacing:8px;">דָּבָר</div>
              </div>
              <p style="color:#4A3F2F;line-height:1.7;margin:0 0 16px;">
                Shalom${user.name ? ` ${user.name}` : ""}! Your account is ready.
              </p>
              <p style="color:#4A3F2F;line-height:1.7;margin:0 0 16px;">
                Each day brings a new question tied to the Hebrew calendar — three levels of difficulty, one Torah thought to carry with you.
              </p>
              <div style="text-align:center;margin:28px 0;">
                <a href="https://daily-davar.vercel.app" style="background:#18285A;color:#F0DFA8;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:16px;font-weight:600;">
                  Start Playing →
                </a>
              </div>
              <p style="color:#8C7B65;font-size:12px;line-height:1.6;margin:0;text-align:center;">
                Questions? Reply to this email or visit <a href="https://daily-davar.vercel.app" style="color:#B8891E;">daily-davar.vercel.app</a>
              </p>
            </div>
          `,
        })
        .catch((e: unknown) => console.error("[register] welcome email failed:", e));
    }

    return NextResponse.json({ ok: true, user }, { status: 201 });
  } catch (err) {
    console.error("[/api/auth/register]", err);
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}
