import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = { title: "Mis cursos" };

export default async function MyCoursesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/mis-cursos");

  const purchases = await prisma.purchase.findMany({
    where: { userId: session.user.id, status: "PAID" },
    include: {
      course: {
        include: {
          modules: {
            orderBy: { order: "asc" },
            include: { lessons: { orderBy: { order: "asc" }, select: { id: true } } },
          },
        },
      },
    },
  });

  const progress = await prisma.progress.findMany({
    where: { userId: session.user.id, completed: true },
    select: { lessonId: true },
  });
  const completedIds = new Set(progress.map((p) => p.lessonId));

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold">Mis cursos</h1>
      <p className="mt-2 text-neutral-600">Continúa donde lo dejaste.</p>

      {purchases.length === 0 ? (
        <div className="card mt-8 p-10 text-center">
          <p className="text-lg text-neutral-600">Aún no tienes cursos.</p>
          <Link href="/cursos" className="btn-primary mt-4">
            Explorar cursos
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {purchases.map(({ course }) => {
            const lessons = course.modules.flatMap((m) => m.lessons);
            const done = lessons.filter((l) => completedIds.has(l.id)).length;
            const pct = lessons.length ? Math.round((done / lessons.length) * 100) : 0;
            const nextLesson =
              lessons.find((l) => !completedIds.has(l.id)) ?? lessons[0];
            return (
              <div key={course.id} className="card overflow-hidden">
                <div className="flex aspect-video items-center justify-center bg-ink text-5xl font-bold text-brand-light">
                  P6
                </div>
                <div className="p-5">
                  <h3 className="font-semibold">{course.title}</h3>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-neutral-200">
                    <div className="h-full bg-brand" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="mt-1 text-sm text-neutral-500">
                    {done} de {lessons.length} lecciones · {pct}%
                  </p>
                  {nextLesson && (
                    <Link
                      href={`/cursos/${course.slug}/leccion/${nextLesson.id}`}
                      className="btn-primary mt-4 w-full"
                    >
                      {pct === 0 ? "Empezar curso" : "Continuar"}
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
