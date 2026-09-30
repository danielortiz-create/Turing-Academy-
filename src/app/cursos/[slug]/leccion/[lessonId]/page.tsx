import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AiBadge } from "@/components/AiBadge";
import { CompleteLessonButton } from "@/components/CompleteLessonButton";
import { GuidedLesson } from "@/components/GuidedLesson";
import { VideoPlayer } from "@/components/VideoPlayer";
import { canAccessCourse } from "@/lib/access";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseBullets, parseQuiz } from "@/lib/tutor";

export const dynamic = "force-dynamic";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId } = await params;
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
  if (!course) notFound();

  const allLessons = course.modules.flatMap((m) => m.lessons);
  const lesson = allLessons.find((l) => l.id === lessonId);
  if (!lesson) notFound();

  const hasAccess = await canAccessCourse(session?.user?.id, course, session?.user?.role);
  if (!hasAccess && !lesson.isFreePreview) {
    redirect(`/cursos/${slug}`);
  }

  const progress = session?.user
    ? await prisma.progress.findMany({
        where: { userId: session.user.id, lessonId: { in: allLessons.map((l) => l.id) } },
      })
    : [];
  const completedIds = new Set(progress.filter((p) => p.completed).map((p) => p.lessonId));

  const index = allLessons.findIndex((l) => l.id === lessonId);
  const prev = index > 0 ? allLessons[index - 1] : null;
  const next = index < allLessons.length - 1 ? allLessons[index + 1] : null;

  const isSlides = lesson.videoProvider === "SLIDES";
  const slides = isSlides
    ? (await prisma.slide.findMany({ where: { lessonId: lesson.id }, orderBy: { order: "asc" } })).map(
        (s) => ({
          id: s.id,
          title: s.title,
          bullets: parseBullets(s.bullets),
          highlight: s.highlight,
          quiz: parseQuiz(s.quiz),
        })
      )
    : [];
  const learnerProfile =
    isSlides && session?.user
      ? await prisma.learnerProfile.findUnique({
          where: { userId: session.user.id },
          select: { role: true, experience: true },
        })
      : null;
  const nextAccessible = next && (hasAccess || next.isFreePreview) ? next : null;

  const header = (
    <>
      <Link href={`/cursos/${slug}`} className="text-sm text-neutral-500 hover:text-brand">
        ← Volver al curso
      </Link>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">{lesson.title}</h1>
        {course.aiGenerated && <AiBadge />}
      </div>
    </>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Lección guiada: el tutor IA conduce y la slide acompaña, a todo el ancho */}
      {isSlides && (
        <div className="mb-10">
          {header}
          <div className="mt-4">
            {slides.length > 0 ? (
              <GuidedLesson
                key={lesson.id}
                lessonId={lesson.id}
                lessonTitle={lesson.title}
                slides={slides}
                isLoggedIn={Boolean(session?.user)}
                initialProfile={learnerProfile}
                nextLessonHref={nextAccessible ? `/cursos/${slug}/leccion/${nextAccessible.id}` : null}
              />
            ) : (
              <p className="card p-6 text-neutral-500">Esta lección aún no tiene diapositivas.</p>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        {/* Reproductor y detalles */}
        <div>
          {!isSlides && (
            <>
              {header}
              <div className="mt-4">
                <VideoPlayer lessonId={lesson.id} />
              </div>
            </>
          )}

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              {prev && (
                <Link href={`/cursos/${slug}/leccion/${prev.id}`} className="btn-secondary">
                  ← Lección anterior
                </Link>
              )}
              {next && (
                <Link href={`/cursos/${slug}/leccion/${next.id}`} className="btn-primary">
                  Lección siguiente →
                </Link>
              )}
            </div>
            {session?.user && (
              <CompleteLessonButton
                lessonId={lesson.id}
                completed={completedIds.has(lesson.id)}
              />
            )}
          </div>

          {lesson.description && (
            <div className="card mt-6 p-5">
              <h2 className="mb-2 font-semibold">Sobre esta lección</h2>
              <p className="text-neutral-600">{lesson.description}</p>
            </div>
          )}
        </div>

        {/* Índice del curso */}
        <aside className="card h-fit overflow-hidden lg:sticky lg:top-24">
          <div className="border-b border-neutral-200 bg-neutral-50 px-4 py-3 font-semibold">
            Contenido del curso
          </div>
          <div className="max-h-[70vh] overflow-y-auto">
            {course.modules.map((mod) => (
              <div key={mod.id}>
                <p className="bg-neutral-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  {mod.title}
                </p>
                <ul>
                  {mod.lessons.map((l) => {
                    const active = l.id === lesson.id;
                    const locked = !hasAccess && !l.isFreePreview;
                    return (
                      <li key={l.id}>
                        {locked ? (
                          <div className="flex items-center gap-2 px-4 py-2.5 text-sm text-neutral-400">
                            🔒 {l.title}
                          </div>
                        ) : (
                          <Link
                            href={`/cursos/${slug}/leccion/${l.id}`}
                            className={`flex items-center gap-2 px-4 py-2.5 text-sm transition ${
                              active
                                ? "border-l-4 border-brand bg-brand/5 font-semibold text-brand"
                                : "hover:bg-neutral-50"
                            }`}
                          >
                            <span>{completedIds.has(l.id) ? "✅" : "▶"}</span>
                            {l.title}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
