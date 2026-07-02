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
