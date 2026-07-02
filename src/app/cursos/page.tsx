import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/access";

export const dynamic = "force-dynamic";

export const metadata = { title: "Cursos" };

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    where: { published: true },
    orderBy: { createdAt: "asc" },
    include: { modules: { include: { lessons: { select: { id: true } } } } },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold">Catálogo de cursos</h1>
      <p className="mt-2 text-neutral-600">
        Formación práctica en herramientas de planificación y control de proyectos.
      </p>

      {courses.length === 0 ? (
        <p className="mt-12 text-neutral-500">Aún no hay cursos publicados. Vuelve pronto.</p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => {
            const lessonCount = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
            return (
              <Link
                key={course.id}
                href={`/cursos/${course.slug}`}
                className="card group overflow-hidden transition hover:shadow-md"
              >
                <div className="flex aspect-video items-center justify-center bg-ink text-5xl font-bold text-brand-light">
                  P6
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold group-hover:text-brand">{course.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-neutral-600">{course.subtitle}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-neutral-500">
                      {course.modules.length} módulos · {lessonCount} lecciones
                    </span>
                    <span className="font-bold text-brand">{formatPrice(course.priceCents)}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
