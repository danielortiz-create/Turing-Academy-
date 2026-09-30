import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Perfil del alumno (rol y experiencia) para que el tutor IA personalice las lecciones
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Inicia sesión" }, { status: 401 });
  const profile = await prisma.learnerProfile.findUnique({
    where: { userId: session.user.id },
    select: { role: true, experience: true },
  });
  return NextResponse.json({ profile });
}

const profileSchema = z.object({
  role: z.string().trim().min(2, "Escribe tu rol").max(80),
  experience: z.string().trim().min(2).max(80),
});

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Inicia sesión" }, { status: 401 });
  const parsed = profileSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
  }
  const profile = await prisma.learnerProfile.upsert({
    where: { userId: session.user.id },
    update: parsed.data,
    create: { userId: session.user.id, ...parsed.data },
    select: { role: true, experience: true },
  });
  return NextResponse.json({ profile });
}
