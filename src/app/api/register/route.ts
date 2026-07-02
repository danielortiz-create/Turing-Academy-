import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ADMIN_EMAIL } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(80),
  email: z.string().email("Correo inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres").max(100),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  const email = parsed.data.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Ya existe una cuenta con este correo. Inicia sesión." },
      { status: 409 }
    );
  }

  const isAdmin = email === ADMIN_EMAIL;

  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      passwordHash: await bcrypt.hash(parsed.data.password, 10),
      role: isAdmin ? "ADMIN" : "STUDENT",
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
