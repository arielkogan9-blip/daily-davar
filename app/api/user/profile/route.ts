import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    const { displayName } = await req.json() as { displayName?: string };

    if (displayName !== undefined) {
      const trimmed = displayName.trim().slice(0, 40);
      await prisma.user.update({
        where: { id: session.user.id },
        data: { name: trimmed || null },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/user/profile]", err);
    return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
  }
}
