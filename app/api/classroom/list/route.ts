import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  try {
    const userId = session.user.id;

    const memberships = await prisma.classroomMember.findMany({
      where: { userId },
      include: {
        classroom: {
          include: {
            _count: { select: { members: true } },
          },
        },
      },
      orderBy: { joinedAt: "desc" },
    });

    const classrooms = memberships.map(({ role, classroom }) => ({
      id:          classroom.id,
      name:        classroom.name,
      code:        classroom.code,
      ownerId:     classroom.ownerId,
      memberCount: classroom._count.members,
      userRole:    role,
      isOwner:     classroom.ownerId === userId,
      createdAt:   classroom.createdAt,
    }));

    return NextResponse.json({ classrooms });
  } catch (err) {
    console.error("[/api/classroom/list]", err);
    return NextResponse.json({ error: "Failed to load classrooms." }, { status: 500 });
  }
}
