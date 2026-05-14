import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  try {
    const { id: classroomId } = await params;
    const userId = session.user.id;

    const membership = await prisma.classroomMember.findUnique({
      where: { classroomId_userId: { classroomId, userId } },
    });
    if (!membership)
      return NextResponse.json({ error: "You are not a member of this classroom." }, { status: 403 });

    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId },
      include: { _count: { select: { members: true } } },
    });
    if (!classroom)
      return NextResponse.json({ error: "Classroom not found." }, { status: 404 });

    return NextResponse.json({
      classroom: {
        id:          classroom.id,
        name:        classroom.name,
        code:        classroom.code,
        ownerId:     classroom.ownerId,
        memberCount: classroom._count.members,
        isOwner:     classroom.ownerId === userId,
        createdAt:   classroom.createdAt,
      },
    });
  } catch (err) {
    console.error("[/api/classroom/[id]]", err);
    return NextResponse.json({ error: "Failed to load classroom." }, { status: 500 });
  }
}
