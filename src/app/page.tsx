import Link from "next/link";
import { AiBadge } from "@/components/AiBadge";
import { prisma } from "@/lib/prisma";
import { courseInitials, formatPrice } from "@/lib/access";

export const dynamic = "force-dynamic";

// Datos de la ilustración del hero (cronograma de ejemplo)
const GANTT_ROWS = [
  { name: "Inicio del proyecto", left: "2%", width: "16%", red: true },
  { name: "Ingeniería", left: "12%", width: "30%", red: false },
  { name: "Procura", left: "30%", width: "28%", red: true },
  { name: "Construcción", left: "48%", width: "34%", red: false },
  { name: "Pruebas", left: "72%", width: "18%", red: true },
  { name: "Puesta en marcha", left: "84%", width: "12%", red: false },
];

const FEATURED = [
  { badge: "P6", title: "Primavera P6 Básico a Avanzado", meta: "24 lecciones" },
  { badge: "📅", title: "Planificación y Control de Proyectos", meta: "18 lecciones" },
  { badge: "📊", title: "Control de Costos y Presupuestos", meta: "16 lecciones" },
];

const TRUSTED_BY = ["acciona", "sacyr", "COSAPI", "OHLA", "GRAÑA Y MONTERO", "pluspetrol"];

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
      <section className="relative overflow-hidden bg-white">
        {/* Resplandor decorativo detrás de la ilustración */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-40 top-10 h-[560px] w-[560px] rounded-full bg-gradient-to-br from-brand/15 via-brand/5 to-transparent blur-2xl"
        />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 py-16 sm:py-20 lg:grid-cols-[1.05fr_1fr]">
          {/* Columna izquierda: mensaje */}
          <div>
            <p className="flex items-center gap-3 text-[13px] font-semibold uppercase tracking-[0.18em] text-brand">
              <span className="h-0.5 w-8 bg-brand" aria-hidden="true" />
              Formación que construye resultados
            </p>
            <h1 className="mt-5 text-4xl font-bold leading-[1.12] tracking-tight text-ink sm:text-5xl xl:text-[3.4rem]">
              Domina la planificación y el control de{" "}
              <span className="text-brand">proyectos</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-neutral-600">
              Aprende Primavera P6, cronogramas, control de costos, reportes y
              gestión de proyectos con expertos en la industria.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/cursos" className="btn-primary text-base">
                Ver cursos <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/registro"
                className="btn-secondary !border-brand/40 !text-brand text-base hover:!border-brand hover:!bg-brand/5"
              >
                Empieza hoy <span aria-hidden="true">→</span>
              </Link>
            </div>

            {/* Estadísticas */}
            <dl className="mt-12 grid gap-4 sm:grid-cols-3 sm:divide-x sm:divide-neutral-200">
              {[
                {
                  title: "+1,000",
                  text: "alumnos capacitados",
                  // Personas
                  icon: (
                    <path d="M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zm7 .5a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM2.5 19c0-3 2.9-5 6.5-5s6.5 2 6.5 5m1-.5c1.9.2 4 1 4 .5 0-2.4-1.9-4-4.5-4.4" />
                  ),
                },
                {
                  title: "Cursos prácticos",
                  text: "100% aplicables",
                  // Birrete de graduación
                  icon: (
                    <path d="M12 4 2.5 8.5 12 13l9.5-4.5L12 4zm-6 7v4.5c0 1.4 2.7 2.8 6 2.8s6-1.4 6-2.8V11m2.5-2v5" />
                  ),
                },
                {
                  title: "Expertos",
                  text: "aprende con los mejores",
                  // Medalla
                  icon: (
                    <path d="M12 15.5a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0-7.5 1 1.9 2.1.3-1.5 1.5.3 2.1-1.9-1-1.9 1 .3-2.1-1.5-1.5 2.1-.3L12 8zm-3.5 6.6L6 21l3.5-1.5L12 21l2.5-1.5L18 21l-2.5-6.4" />
                  ),
                },
              ].map((s, i) => (
                <div key={s.title} className={`flex items-center gap-3 ${i > 0 ? "sm:pl-4" : ""}`}>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-brand/15 bg-brand/5">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-[22px] w-[22px]"
                      fill="none"
                      stroke="#C8102E"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      {s.icon}
                    </svg>
                  </span>
                  <div>
                    <dt className="text-[15px] font-bold text-ink">{s.title}</dt>
                    <dd className="mt-0.5 text-[13px] text-neutral-500">{s.text}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>

          {/* Columna derecha: ilustración del cronograma, con leve perspectiva 3D */}
          <div
            className="relative hidden min-h-[600px] lg:block [transform:perspective(1800px)_rotateX(4deg)_rotateY(-16deg)_rotate(-0.5deg)]"
            aria-hidden="true"
          >
            {/* Tarjeta principal: Gantt */}
            <div className="absolute left-0 top-0 w-full rounded-2xl border border-neutral-200 bg-white p-7 shadow-[0_24px_50px_-12px_rgba(30,36,48,0.25)]">
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold text-ink">Cronograma del Proyecto</p>
                <span className="rounded-md border border-neutral-200 px-2.5 py-1 text-xs text-neutral-400">
                  ⚙ Filtro
                </span>
              </div>
              <div className="mt-5 grid grid-cols-[128px_1fr] gap-3">
                <p className="text-xs font-medium text-neutral-400">Actividades</p>
                <div className="flex justify-between px-1 text-xs font-medium uppercase text-neutral-400">
                  <span>May</span><span>Jun</span><span>Jul</span><span>Ago</span><span>Sep</span>
                </div>
              </div>
              <div className="relative mt-2 space-y-4">
                {/* Línea de "hoy" */}
                <div className="absolute bottom-0 left-[calc(128px+12px+34%)] top-0 z-10 w-px bg-brand">
                  <span className="absolute -top-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-brand" />
                </div>
                {GANTT_ROWS.map((row) => (
                  <div key={row.name} className="grid grid-cols-[128px_1fr] items-center gap-3">
                    <p className="flex items-center gap-2 truncate text-[13px] text-neutral-600">
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${row.red ? "bg-brand" : "bg-ink"}`}
                      />
                      {row.name}
                    </p>
                    <div className="relative h-5 rounded-md bg-neutral-100">
                      <div
                        className={`absolute top-0 h-full rounded-md ${row.red ? "bg-brand" : "bg-ink"}`}
                        style={{ left: row.left, width: row.width }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rendimiento del proyecto (donut) */}
            <div className="absolute -right-2 top-[205px] z-20 w-64 rounded-2xl border border-neutral-200 bg-white p-4 shadow-[0_18px_40px_-10px_rgba(30,36,48,0.28)]">
              <p className="text-xs font-semibold text-ink">Rendimiento del Proyecto</p>
              <div className="mt-3 flex items-center gap-4">
                <svg viewBox="0 0 36 36" className="h-20 w-20 -rotate-90">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="#F0EFED" strokeWidth="5" />
                  <circle
                    cx="18" cy="18" r="15" fill="none" stroke="#C8102E" strokeWidth="5"
                    strokeDasharray="67.9 94.2" strokeLinecap="round"
                  />
                </svg>
                <div>
                  <p className="text-2xl font-bold text-ink">72%</p>
                  <p className="text-[11px] text-neutral-500">Completado</p>
                </div>
              </div>
              <ul className="mt-3 space-y-1.5 text-[11px] text-neutral-600">
                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-ink" /> En Progreso
                  </span>
                  <span className="font-semibold">12</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand" /> Completadas
                  </span>
                  <span className="font-semibold">28</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-neutral-300" /> Pendientes
                  </span>
                  <span className="font-semibold">7</span>
                </li>
              </ul>
            </div>

            {/* Control de costos */}
            <div className="absolute bottom-14 left-0 z-20 w-48 rounded-2xl border border-neutral-200 bg-white p-4 shadow-[0_18px_40px_-10px_rgba(30,36,48,0.28)]">
              <p className="text-[11px] font-medium text-neutral-500">Control de Costos</p>
              <p className="mt-1 text-xl font-bold text-ink">US$ 2.4M</p>
              <p className="text-[10px] text-neutral-400">Presupuesto</p>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-100">
                  <div className="h-full w-[72%] rounded-full bg-ink" />
                </div>
                <span className="text-[10px] font-bold text-brand">72%</span>
              </div>
            </div>

            {/* Desviación del cronograma */}
            <div className="absolute bottom-48 left-[215px] z-10 w-52 rounded-2xl border border-neutral-200 bg-white p-4 shadow-[0_18px_40px_-10px_rgba(30,36,48,0.28)]">
              <p className="text-[11px] font-medium text-neutral-500">Desviación del Cronograma</p>
              <p className="mt-1 text-xl font-bold text-brand">-5 días</p>
              <p className="text-[10px] text-neutral-400">Respecto a la línea base</p>
              <svg viewBox="0 0 100 24" className="mt-2 h-6 w-full">
                <polyline
                  points="0,20 14,17 28,18 42,13 56,15 70,9 84,10 100,4"
                  fill="none" stroke="#C8102E" strokeWidth="2" strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Cursos destacados */}
            <div className="absolute bottom-0 right-0 z-30 w-[58%] rounded-2xl border border-neutral-200 bg-white p-4 shadow-[0_18px_40px_-10px_rgba(30,36,48,0.28)]">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-ink">Cursos destacados</p>
                <span className="text-[10px] font-semibold text-brand">Ver todos</span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {FEATURED.map((c) => (
                  <div key={c.title} className="rounded-xl border border-neutral-200 p-2.5">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-brand text-[11px] font-bold text-white">
                      {c.badge}
                    </span>
                    <p className="mt-2 text-[10.5px] font-semibold leading-tight text-ink">
                      {c.title}
                    </p>
                    <p className="mt-1 text-[9.5px] text-neutral-400">{c.meta}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Empresas que confían */}
        <div className="relative border-t border-neutral-100">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 py-7">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
              Con la confianza de profesionales de
            </p>
            {TRUSTED_BY.map((name) => (
              <span
                key={name}
                className="text-sm font-bold uppercase tracking-wide text-neutral-300"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Cursos destacados */}
      {courses.length > 0 && (
        <section className="bg-neutral-50 py-16">
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
                      {courseInitials(course.title)}
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-semibold group-hover:text-brand">
                        {course.title}
                      </h3>
                  {course.aiGenerated && <AiBadge className="mt-2" />}
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
