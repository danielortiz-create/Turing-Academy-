import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/access";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const courses = await prisma.course.findMany({
    where: { published: true },
    orderBy: { createdAt: "asc" },
    take: 3,
    include: { modules: { include: { lessons: { select: { id: true } } } } },
  });

  return (
    <>
      {/* Hero */}
      <section className="bg-ink text-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <p className="mb-4 inline-block rounded-full border border-brand/50 bg-brand/10 px-4 py-1 text-sm font-medium text-brand-light">
            Formación para ingenieros
          </p>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
            Domina <span className="text-brand-light">Primavera P6</span> y la
            planificación de proyectos
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-neutral-300">
            Cursos prácticos de ingeniería en video, creados por profesionales.
            Aprende a tu ritmo, con acceso de por vida y certifícate en las
            herramientas que la industria exige.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/cursos" className="btn-primary text-lg">
              Ver cursos
            </Link>
            <Link
              href="/registro"
              className="btn-secondary !border-neutral-600 !bg-transparent !text-white text-lg hover:!bg-white/10"
            >
              Crear cuenta gratis
            </Link>
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              title: "Videos paso a paso",
              text: "Lecciones en video organizadas por módulos, desde nivel cero hasta control de proyectos real.",
            },
            {
              title: "Acceso protegido",
              text: "Tu compra te da acceso personal e ilimitado. Inicia sesión con tu correo o tu cuenta de Google.",
            },
            {
              title: "Enfoque en ingeniería",
              text: "Ejemplos reales de construcción e ingeniería: WBS, ruta crítica, recursos, líneas base y avance.",
            },
          ].map((f) => (
            <div key={f.title} className="card p-6">
              <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
              <p className="text-neutral-600">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cursos destacados */}
      {courses.length > 0 && (
        <section className="bg-white py-16">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="mb-8 text-3xl font-bold">Cursos disponibles</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => {
                const lessonCount = course.modules.reduce(
                  (acc, m) => acc + m.lessons.length,
                  0
                );
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
                      <h3 className="text-lg font-semibold group-hover:text-brand">
                        {course.title}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-sm text-neutral-600">
                        {course.subtitle}
                      </p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-sm text-neutral-500">
                          {course.modules.length} módulos · {lessonCount} lecciones
                        </span>
                        <span className="font-bold text-brand">
                          {formatPrice(course.priceCents)}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
