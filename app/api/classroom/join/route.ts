import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  try {
    const { code } = await req.json() as { code?: string };
    if (!code?.trim())
      return NextResponse.json({ error: "Classroom code is required." }, { status: 400 });

    const classroom = await prisma.classroom.findUnique({
      where: { code: code.toUpperCase().trim() },
    });
    if (!classroom)
      return NextResponse.json({ error: "No classroom found with that code." }, { status: 404 });

    // Idempotent — silently succeed if already a member
    const existing = await prisma.classroomMember.findUnique({
      where: { classroomId_userId: { classroomId: classroom.id, userId: session.user.id } },
    });
    if (existing)
      return NextResponse.json({ ok: true, classroom, alreadyMember: true });

    await prisma.classroomMember.create({
      data: {
        classroomId: classroom.id,
        userId:      session.user.id,
        role:        "student",
      },
    });

    return NextResponse.json({ ok: true, classroom }, { status: 201 });
  } catch (err) {
    console.error("[/api/classroom/join]", err);
    return NextResponse.json({ error: "Failed to join classroom." }, { status: 500 });
  }
}
