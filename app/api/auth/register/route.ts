import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
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

    return NextResponse.json({ ok: true, user }, { status: 201 });
  } catch (err) {
    console.error("[/api/auth/register]", err);
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}
