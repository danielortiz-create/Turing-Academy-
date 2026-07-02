import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  createLesson,
  createModule,
  deleteCourse,
  deleteLesson,
  deleteModule,
  updateCourse,
} from "@/app/admin/actions";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = { title: "Editar curso" };

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/");

  const { courseId } = await params;
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" } } },
      },
    },
  });
  if (!course) notFound();

  const updateAction = updateCourse.bind(null, course.id);
  const createModuleAction = createModule.bind(null, course.id);
  const deleteCourseAction = deleteCourse.bind(null, course.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link href="/admin" className="text-sm text-neutral-500 hover:text-brand">
        ← Volver a administración
      </Link>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Editar curso</h1>
        <Link
          href={`/cursos/${course.slug}`}
          className="text-sm font-semibold text-brand hover:underline"
        >
          Ver como estudiante →
        </Link>
      </div>

      {/* Datos del curso */}
      <form action={updateAction} className="card mt-8 space-y-5 p-6">
        <div>
          <label className="mb-1 block text-sm font-medium">Título *</label>
          <input name="title" required defaultValue={course.title} className="input" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Subtítulo</label>
          <input name="subtitle" defaultValue={course.subtitle ?? ""} className="input" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Descripción</label>
          <textarea
            name="description"
            rows={5}
            defaultValue={course.description}
            className="input"
          />
        </div>
        <div className="flex flex-wrap items-end gap-6">
          <div>
            <label className="mb-1 block text-sm font-medium">Precio (USD)</label>
            <input
              name="price"
              type="number"
              step="0.01"
              min="0"
              defaultValue={(course.priceCents / 100).toFixed(2)}
              className="input w-40"
            />
          </div>
          <label className="flex items-center gap-2 pb-2.5 text-sm font-medium">
            <input
              type="checkbox"
              name="published"
              defaultChecked={course.published}
              className="h-4 w-4 accent-brand"
            />
            Publicado (visible en el catálogo)
          </label>
        </div>
        <button type="submit" className="btn-primary">
          Guardar cambios
        </button>
      </form>

      {/* Módulos y lecciones */}
      <h2 className="mt-12 text-2xl font-bold">Módulos y lecciones</h2>
      <div className="mt-4 space-y-6">
        {course.modules.map((mod) => {
          const createLessonAction = createLesson.bind(null, mod.id, course.id);
          const deleteModuleAction = deleteModule.bind(null, mod.id, course.id);
          return (
            <div key={mod.id} className="card overflow-hidden">
              <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-5 py-3">
                <span className="font-semibold">{mod.title}</span>
                <form action={deleteModuleAction}>
                  <button className="text-sm text-neutral-400 hover:text-brand" type="submit">
                    Eliminar módulo
                  </button>
                </form>
              </div>

              <ul className="divide-y divide-neutral-100">
                {mod.lessons.map((lesson) => {
                  const deleteLessonAction = deleteLesson.bind(null, lesson.id, course.id);
                  return (
                    <li key={lesson.id} className="flex items-center justify-between px-5 py-3">
                      <div>
                        <p className="font-medium">
                          {lesson.title}
                          {lesson.isFreePreview && (
                            <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                              Vista previa
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {lesson.videoProvider} · {lesson.videoRef || "sin video"}
                          {lesson.durationMin ? ` · ${lesson.durationMin} min` : ""}
                        </p>
                      </div>
                      <form action={deleteLessonAction}>
                        <button
                          className="text-sm text-neutral-400 hover:text-brand"
                          type="submit"
                        >
                          Eliminar
                        </button>
                      </form>
                    </li>
                  );
                })}
              </ul>

              {/* Nueva lección */}
              <form
                action={createLessonAction}
                className="grid gap-3 border-t border-neutral-200 bg-neutral-50 p-5 sm:grid-cols-2"
              >
                <input name="title" required placeholder="Título de la lección *" className="input" />
                <input name="description" placeholder="Descripción breve" className="input" />
                <select name="videoProvider" className="input" defaultValue="YOUTUBE">
                  <option value="YOUTUBE">YouTube (ID del video)</option>
                  <option value="VIMEO">Vimeo (ID del video)</option>
                  <option value="MP4">MP4 en el servidor (nombre de archivo)</option>
                </select>
                <input
                  name="videoRef"
                  placeholder="Ej: dQw4w9WgXcQ o leccion1.mp4"
                  className="input"
                />
                <input
                  name="durationMin"
                  type="number"
                  min="1"
                  placeholder="Duración (min)"
                  className="input"
                />
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="isFreePreview" className="h-4 w-4 accent-brand" />
                  Vista previa gratuita
                </label>
                <button type="submit" className="btn-secondary sm:col-span-2">
                  + Agregar lección
                </button>
              </form>
            </div>
          );
        })}
      </div>

      {/* Nuevo módulo */}
      <form action={createModuleAction} className="card mt-6 flex gap-3 p-5">
        <input
          name="title"
          required
          placeholder="Título del nuevo módulo (ej: Módulo 4 · Reportes)"
          className="input"
        />
        <button type="submit" className="btn-primary whitespace-nowrap">
          + Agregar módulo
        </button>
      </form>

      {/* Zona de peligro */}
      <div className="card mt-10 border-brand/30 p-5">
        <h3 className="font-semibold text-brand">Zona de peligro</h3>
        <p className="mt-1 text-sm text-neutral-600">
          Eliminar el curso borra sus módulos, lecciones y compras. Esta acción no se puede
          deshacer.
        </p>
        <form action={deleteCourseAction} className="mt-3">
          <button type="submit" className="btn-secondary !border-brand !text-brand">
            Eliminar curso
          </button>
        </form>
      </div>
    </div>
  );
}
