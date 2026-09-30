import Link from "next/link";
import { notFound } from "next/navigation";
import { AiBadge } from "@/components/AiBadge";
import { BuyButton } from "@/components/BuyButton";
import { canAccessCourse, courseInitials, formatPrice } from "@/lib/access";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CoursePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ compra?: string }>;
}) {
  const { slug } = await params;
  const { compra } = await searchParams;
  const session = await auth();

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" } } },
      },
    },
  });
  if (!course || (!course.published && session?.user?.role !== "ADMIN")) notFound();

  const hasAccess = await canAccessCourse(session?.user?.id, course, session?.user?.role);
  const lessonCount = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const totalMin = course.modules.reduce(
    (acc, m) => acc + m.lessons.reduce((a, l) => a + (l.durationMin ?? 0), 0),
    0
  );
  const firstLesson = course.modules[0]?.lessons[0];
  const isSlideCourse = course.modules.some((m) => m.lessons.some((l) => l.videoProvider === "SLIDES"));

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {compra === "exitosa" && !hasAccess && (
        <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-800">
          Estamos confirmando tu pago con Stripe. Actualiza la página en unos segundos.
        </div>
      )}
      {compra === "exitosa" && hasAccess && (
        <div className="mb-6 rounded-lg border border-green-300 bg-green-50 p-4 text-green-800">
          ¡Compra exitosa! Ya tienes acceso completo al curso.
        </div>
      )}
      {compra === "cancelada" && (
        <div className="mb-6 rounded-lg border border-neutral-300 bg-neutral-100 p-4 text-neutral-700">
          El pago fue cancelado. Puedes intentarlo de nuevo cuando quieras.
        </div>
      )}

      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <div>
          {course.aiGenerated && <AiBadge className="mb-3" />}
          <h1 className="text-3xl font-bold sm:text-4xl">{course.title}</h1>
          {course.subtitle && <p className="mt-3 text-lg text-neutral-600">{course.subtitle}</p>}
          <p className="mt-2 text-sm text-neutral-500">
            {course.modules.length} módulos · {lessonCount} lecciones
            {totalMin > 0 && ` · ${Math.floor(totalMin / 60)} h ${totalMin % 60} min de ${isSlideCourse ? "contenido" : "video"}`}
          </p>

          <div className="prose mt-6 max-w-none text-neutral-700">
            <p>{course.description}</p>
          </div>

          <h2 className="mt-10 text-2xl font-bold">Contenido del curso</h2>
          <div className="mt-4 space-y-4">
            {course.modules.map((mod) => (
              <div key={mod.id} className="card overflow-hidden">
                <div className="border-b border-neutral-200 bg-neutral-50 px-5 py-3 font-semibold">
                  {mod.title}
                </div>
                <ul className="divide-y divide-neutral-100">
                  {mod.lessons.map((lesson) => {
                    const watchable = hasAccess || lesson.isFreePreview;
                    return (
                      <li key={lesson.id}>
                        {watchable ? (
                          <Link
                            href={`/cursos/${course.slug}/leccion/${lesson.id}`}
                            className="flex items-center justify-between px-5 py-3 transition hover:bg-neutral-50"
                          >
                            <span className="flex items-center gap-3">
                              <span className="text-brand">▶</span>
                              {lesson.title}
                              {lesson.isFreePreview && !hasAccess && (
                                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                                  Vista previa gratis
                                </span>
                              )}
                            </span>
                            {lesson.durationMin && (
                              <span className="text-sm text-neutral-400">
                                {lesson.durationMin} min
                              </span>
                            )}
                          </Link>
                        ) : (
                          <div className="flex items-center justify-between px-5 py-3 text-neutral-400">
                            <span className="flex items-center gap-3">
                              <span>🔒</span>
                              {lesson.title}
                            </span>
                            {lesson.durationMin && (
                              <span className="text-sm">{lesson.durationMin} min</span>
                            )}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Panel lateral de compra */}
        <aside>
          <div className="card sticky top-24 p-6">
            <div className="flex aspect-video items-center justify-center rounded-lg bg-ink text-5xl font-bold text-brand-light">
              {courseInitials(course.title)}
            </div>
            <p className="mt-5 text-center text-3xl font-bold">
              {formatPrice(course.priceCents)}
            </p>
            <div className="mt-5">
              {hasAccess ? (
                firstLesson ? (
                  <Link
                    href={`/cursos/${course.slug}/leccion/${firstLesson.id}`}
                    className="btn-primary w-full text-lg"
                  >
                    Continuar el curso
                  </Link>
                ) : (
                  <p className="text-center text-neutral-500">El contenido llegará pronto</p>
                )
              ) : course.priceCents === 0 ? (
                <Link href="/registro" className="btn-primary w-full text-lg">
                  Crear cuenta gratis y empezar
                </Link>
              ) : (
                <BuyButton
                  courseId={course.id}
                  isLoggedIn={Boolean(session?.user)}
                  priceLabel={formatPrice(course.priceCents)}
                />
              )}
            </div>
            <ul className="mt-6 space-y-2 text-sm text-neutral-600">
              <li>✓ Acceso de por vida</li>
              {isSlideCourse ? (
                <li>✓ Tutor IA que responde tus dudas</li>
              ) : (
                <li>✓ Videos en alta calidad</li>
              )}
              <li>✓ Aprende a tu ritmo</li>
              <li>✓ Seguimiento de tu progreso</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
