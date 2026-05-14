import { NextResponse } from "next/server";
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

    await prisma.suggestion.create({
      data: {
        email:      normalised || "anonymous",
        suggestion: suggestion.trim(),
      },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("[/api/digest/suggest]", err);
    return NextResponse.json({ error: "Failed to save suggestion." }, { status: 500 });
  }
}
