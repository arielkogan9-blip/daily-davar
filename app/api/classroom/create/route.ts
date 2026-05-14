import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasFeature } from "@/lib/tierAccess";

// Generate a random uppercase 6-character alphanumeric code
function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // omit ambiguous chars 0/O, 1/I
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  if (!hasFeature(session.user.tier, "classroom"))
    return NextResponse.json({ error: "Classrooms require a Scholar membership." }, { status: 403 });

  try {
    const { name } = await req.json() as { name?: string };
    if (!name?.trim())
      return NextResponse.json({ error: "Classroom name is required." }, { status: 400 });

    // Generate a unique code (retry on collision)
    let code = generateCode();
    let attempts = 0;
    while (attempts < 10) {
      const existing = await prisma.classroom.findUnique({ where: { code } });
      if (!existing) break;
      code = generateCode();
      attempts++;
    }

    const classroom = await prisma.classroom.create({
      data: {
        name:    name.trim(),
        code,
        ownerId: session.user.id,
        members: {
          create: {
            userId: session.user.id,
            role:   "owner",
          },
        },
      },
      include: { members: true },
    });

    return NextResponse.json({ ok: true, classroom }, { status: 201 });
  } catch (err) {
    console.error("[/api/classroom/create]", err);
    return NextResponse.json({ error: "Failed to create classroom." }, { status: 500 });
  }
}
