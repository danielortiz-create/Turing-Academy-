import { prisma } from "@/lib/prisma";

/**
 * Regla central de acceso a contenido: un usuario puede ver una lección si
 * es admin, si la lección es vista previa gratuita, si el curso es gratis,
 * o si tiene una compra pagada del curso.
 */
export async function canAccessCourse(
  userId: string | undefined,
  course: { id: string; priceCents: number },
  userRole?: string
): Promise<boolean> {
  if (userRole === "ADMIN") return true;
  if (course.priceCents === 0) return Boolean(userId);
  if (!userId) return false;
  const purchase = await prisma.purchase.findUnique({
    where: { userId_courseId: { userId, courseId: course.id } },
    select: { status: true },
  });
  return purchase?.status === "PAID";
}

export function formatPrice(cents: number): string {
  if (cents === 0) return "Gratis";
  return new Intl.NumberFormat("es", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

// Iniciales para la miniatura del curso: "P6" para Primavera, "GP" para
// "Introducción a la gestión de proyectos", etc.
export function courseInitials(title: string): string {
  const p6 = /primavera\s*p6/i.test(title);
  if (p6) return "P6";
  const skip = new Set(["a", "al", "de", "del", "la", "las", "el", "los", "y", "en", "introduccion", "introducción", "curso"]);
  const words = title.split(/\s+/).filter((w) => !skip.has(w.toLowerCase()));
  return words.slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "C";
}
