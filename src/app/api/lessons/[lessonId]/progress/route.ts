import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Marca una lección como completada / no completada
export async function POST(
  req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 });
  }

  const { completed } = await req.json().catch(() => ({ completed: true }));

  await prisma.progress.upsert({
    where: { userId_lessonId: { userId: session.user.id, lessonId } },
    update: { completed: Boolean(completed), completedAt: completed ? new Date() : null },
    create: {
      userId: session.user.id,
      lessonId,
      completed: Boolean(completed),
      completedAt: completed ? new Date() : null,
    },
  });

  return NextResponse.json({ ok: true });
}
