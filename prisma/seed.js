// Datos iniciales: curso de Primavera P6 con módulos y lecciones de ejemplo.
// Ejecutar con: npm run db:seed
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const gestionProyectos = require("./courses/gestion-proyectos");

const prisma = new PrismaClient();

async function main() {
  const adminEmail = (
    process.env.ADMIN_EMAIL || "danielortizvargas21@gmail.com"
  ).toLowerCase();
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN" },
    create: {
      email: adminEmail,
      name: "Administrador",
      role: "ADMIN",
      passwordHash: await bcrypt.hash("admin1234", 10),
    },
  });

  const course = await prisma.course.upsert({
    where: { slug: "primavera-p6-desde-cero" },
    update: {},
    create: {
      slug: "primavera-p6-desde-cero",
      title: "Primavera P6 desde cero",
      subtitle: "Planificación y control de proyectos de ingeniería con Oracle Primavera P6",
      description:
        "Aprende a planificar, programar y controlar proyectos de ingeniería y construcción con Oracle Primavera P6 Professional. " +
        "Desde la creación de tu primer proyecto hasta el control de avance con líneas base, este curso te lleva paso a paso " +
        "con ejercicios prácticos reales del sector.",
      priceCents: 4900,
      published: true,
      modules: {
        create: [
          {
            title: "Módulo 1 · Introducción a Primavera P6",
            order: 1,
            lessons: {
              create: [
                {
                  title: "Bienvenida al curso",
                  description: "Qué aprenderás y cómo está organizado el curso.",
                  order: 1,
                  videoProvider: "YOUTUBE",
                  videoRef: "dQw4w9WgXcQ",
                  durationMin: 5,
                  isFreePreview: true,
                },
                {
                  title: "Instalación y configuración de P6",
                  description: "Instala Primavera P6 Professional y configura tu entorno de trabajo.",
                  order: 2,
                  videoProvider: "YOUTUBE",
                  videoRef: "dQw4w9WgXcQ",
                  durationMin: 18,
                },
                {
                  title: "La interfaz de P6: vistas y layouts",
                  description: "Recorrido por la interfaz, tablas, diagrama de Gantt y layouts.",
                  order: 3,
                  videoProvider: "YOUTUBE",
                  videoRef: "dQw4w9WgXcQ",
                  durationMin: 22,
                },
              ],
            },
          },
          {
            title: "Módulo 2 · Estructura y actividades del proyecto",
            order: 2,
            lessons: {
              create: [
                {
                  title: "EPS, OBS y creación del proyecto",
                  description: "Estructura de proyectos de la empresa y creación de tu primer proyecto.",
                  order: 1,
                  videoProvider: "YOUTUBE",
                  videoRef: "dQw4w9WgXcQ",
                  durationMin: 25,
                },
                {
                  title: "WBS: estructura de desglose del trabajo",
                  description: "Cómo construir una WBS sólida para proyectos de ingeniería.",
                  order: 2,
                  videoProvider: "YOUTUBE",
                  videoRef: "dQw4w9WgXcQ",
                  durationMin: 20,
                },
                {
                  title: "Actividades, duraciones y relaciones",
                  description: "Tipos de actividad, duraciones y lógica de precedencias (FS, SS, FF, SF).",
                  order: 3,
                  videoProvider: "YOUTUBE",
                  videoRef: "dQw4w9WgXcQ",
                  durationMin: 30,
                },
              ],
            },
          },
          {
            title: "Módulo 3 · Programación, recursos y control",
            order: 3,
            lessons: {
              create: [
                {
                  title: "Cálculo de la programación y ruta crítica",
                  description: "El motor de cálculo de P6, holguras y análisis de ruta crítica.",
                  order: 1,
                  videoProvider: "YOUTUBE",
                  videoRef: "dQw4w9WgXcQ",
                  durationMin: 28,
                },
                {
                  title: "Recursos y costos",
                  description: "Asignación de recursos, curvas y presupuesto del proyecto.",
                  order: 2,
                  videoProvider: "YOUTUBE",
                  videoRef: "dQw4w9WgXcQ",
                  durationMin: 26,
                },
                {
                  title: "Línea base y control de avance",
                  description: "Guarda líneas base, actualiza avance y analiza desviaciones.",
                  order: 3,
                  videoProvider: "YOUTUBE",
                  videoRef: "dQw4w9WgXcQ",
                  durationMin: 32,
                },
              ],
            },
          },
        ],
      },
    },
  });

  const slideCourse = await syncSlideCourse(gestionProyectos);

  console.log(`Seed listo. Cursos: ${course.title} · ${slideCourse.title}`);
  console.log(`Admin: ${adminEmail} (password inicial: admin1234 — cámbiala)`);
}

// Sincroniza un curso de slides definido en prisma/courses/. Módulos y
// lecciones se buscan por título para conservar el progreso de los alumnos;
// las slides se reemplazan para reflejar siempre el contenido del archivo.
async function syncSlideCourse(def) {
  const courseData = {
    title: def.title,
    subtitle: def.subtitle,
    description: def.description,
    priceCents: def.priceCents,
    aiGenerated: def.aiGenerated,
    published: true,
  };
  const course = await prisma.course.upsert({
    where: { slug: def.slug },
    update: courseData,
    create: { slug: def.slug, ...courseData },
  });

  for (const [mi, modDef] of def.modules.entries()) {
    const existingMod = await prisma.module.findFirst({
      where: { courseId: course.id, title: modDef.title },
    });
    const mod = existingMod
      ? await prisma.module.update({ where: { id: existingMod.id }, data: { order: mi + 1 } })
      : await prisma.module.create({
          data: { courseId: course.id, title: modDef.title, order: mi + 1 },
        });

    for (const [li, lessonDef] of modDef.lessons.entries()) {
      const lessonData = {
        description: lessonDef.description,
        durationMin: lessonDef.durationMin,
        order: li + 1,
        videoProvider: "SLIDES",
        videoRef: null,
        isFreePreview: mi === 0 && li === 0,
      };
      const existingLesson = await prisma.lesson.findFirst({
        where: { moduleId: mod.id, title: lessonDef.title },
      });
      const lesson = existingLesson
        ? await prisma.lesson.update({ where: { id: existingLesson.id }, data: lessonData })
        : await prisma.lesson.create({
            data: { moduleId: mod.id, title: lessonDef.title, ...lessonData },
          });

      await prisma.slide.deleteMany({ where: { lessonId: lesson.id } });
      await prisma.slide.createMany({
        data: lessonDef.slides.map((slide, si) => ({
          lessonId: lesson.id,
          order: si + 1,
          title: slide.title,
          bullets: JSON.stringify(slide.bullets),
          highlight: slide.highlight ?? null,
          tutorNotes: slide.tutorNotes ?? null,
          quiz: slide.quiz ? JSON.stringify(slide.quiz) : null,
        })),
      });
    }
  }
  return course;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
