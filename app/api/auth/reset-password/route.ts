import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rateLimit, getIP } from "@/lib/ratelimit";

export async function POST(req: Request) {
  if (!rateLimit(`reset-pw:${getIP(req)}`, 5, 300_000)) {
    return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  }

  try {
    const { token, password } = await req.json() as { token?: string; password?: string };

    if (!token?.trim()) return NextResponse.json({ error: "Reset token is required." }, { status: 400 });
    if (!password || password.length < 8)
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });

    const record = await prisma.passwordResetToken.findUnique({ where: { token } });

    if (!record || record.used || record.expiresAt < new Date()) {
      return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 12);

    await prisma.$transaction([
      prisma.user.update({ where: { id: record.userId }, data: { password: hashed } }),
      prisma.passwordResetToken.update({ where: { id: record.id }, data: { used: true } }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/auth/reset-password]", err);
    return NextResponse.json({ error: "Failed to reset password." }, { status: 500 });
  }
}
