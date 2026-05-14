import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, tier } = await req.json() as { email?: string; tier?: string };

    if (!email?.trim())
      return NextResponse.json({ error: "Email is required." }, { status: 400 });

    const validTiers = ["plus", "scholar"];
    if (!tier || !validTiers.includes(tier))
      return NextResponse.json({ error: "Invalid tier. Must be 'plus' or 'scholar'." }, { status: 400 });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const normalised = email.toLowerCase().trim();
    if (!emailRegex.test(normalised))
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });

    // No strict duplicates — allow re-joining for different tiers, but not the exact same combination
    const existing = await prisma.waitlistEntry.findFirst({
      where: { email: normalised, tier },
    });
    if (existing)
      return NextResponse.json({ ok: true, alreadyJoined: true }, { status: 200 });

    await prisma.waitlistEntry.create({ data: { email: normalised, tier } });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("[/api/waitlist]", err);
    return NextResponse.json({ error: "Failed to join waitlist." }, { status: 500 });
  }
}
