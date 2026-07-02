import Link from "next/link";
import { redirect } from "next/navigation";
import { formatPrice } from "@/lib/access";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = { title: "Administración" };

export default async function AdminPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/");

  const [courses, studentCount, paidPurchases] = await Promise.all([
    prisma.course.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { purchases: { where: { status: "PAID" } } } } },
    }),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.purchase.aggregate({
      where: { status: "PAID" },
      _sum: { amountCents: true },
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Administración</h1>
        <Link href="/admin/cursos/nuevo" className="btn-primary">
          + Nuevo curso
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-sm text-neutral-500">Estudiantes registrados</p>
          <p className="text-3xl font-bold">{studentCount}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-neutral-500">Cursos</p>
          <p className="text-3xl font-bold">{courses.length}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-neutral-500">Ingresos (pagos confirmados)</p>
          <p className="text-3xl font-bold">
            {formatPrice(paidPurchases._sum.amountCents ?? 0)}
          </p>
        </div>
      </div>

      <h2 className="mt-10 text-xl font-bold">Cursos</h2>
      <div className="card mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-500">
            <tr>
              <th className="px-5 py-3">Curso</th>
              <th className="px-5 py-3">Precio</th>
              <th className="px-5 py-3">Estado</th>
              <th className="px-5 py-3">Ventas</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {courses.map((course) => (
              <tr key={course.id}>
                <td className="px-5 py-3 font-medium">{course.title}</td>
                <td className="px-5 py-3">{formatPrice(course.priceCents)}</td>
                <td className="px-5 py-3">
                  {course.published ? (
                    <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                      Publicado
                    </span>
                  ) : (
                    <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600">
                      Borrador
                    </span>
                  )}
                </td>
                <td className="px-5 py-3">{course._count.purchases}</td>
                <td className="px-5 py-3 text-right">
                  <Link
                    href={`/admin/cursos/${course.id}`}
                    className="font-semibold text-brand hover:underline"
                  >
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
            {courses.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-neutral-500">
                  Aún no hay cursos. Crea el primero.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
