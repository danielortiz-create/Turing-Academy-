import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";

// Límites del tutor IA por alumno:
// - lecciones guiadas NUEVAS por día (volver a una ya empezada hoy no cuenta)
// - llamadas por lección y día, y llamadas totales por día (anti-abuso)
export const DAILY_LESSON_LIMIT = 5;
export const LESSON_CALL_CAP = 60;
export const DAILY_CALL_CAP = 200;

// Modelo económico para conducir lecciones (muchas llamadas por lección)
export const TUTOR_MODEL = "claude-sonnet-5-5";

// Instancia perezosa: el sitio funciona aunque la clave aún no esté configurada
let client: Anthropic | null = null;

export function isTutorConfigured() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export function getAnthropic(): Anthropic {
  if (!client) client = new Anthropic();
  return client;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export type UsageStatus = { lessonsLeft: number; lessonStarted: boolean };

export async function usageStatus(userId: string, lessonId?: string): Promise<UsageStatus> {
  const rows = await prisma.tutorLessonUsage.findMany({ where: { userId, day: today() } });
  return {
    lessonsLeft: Math.max(0, DAILY_LESSON_LIMIT - rows.length),
    lessonStarted: lessonId ? rows.some((r) => r.lessonId === lessonId) : false,
  };
}

export type ConsumeResult = { ok: true } | { ok: false; reason: "lessons" | "lesson_cap" | "daily" };

/** Registra una llamada al tutor. Si supera algún límite no descuenta nada. */
export async function consumeCall(userId: string, lessonId: string): Promise<ConsumeResult> {
  const day = today();
  const total = await prisma.tutorUsage.upsert({
    where: { userId_day: { userId, day } },
    update: { count: { increment: 1 } },
    create: { userId, day, count: 1 },
  });
  const undoTotal = () =>
    prisma.tutorUsage.update({ where: { userId_day: { userId, day } }, data: { count: { decrement: 1 } } });
  if (total.count > DAILY_CALL_CAP) {
    await undoTotal();
    return { ok: false, reason: "daily" };
  }

  const key = { userId_day_lessonId: { userId, day, lessonId } };
  const lesson = await prisma.tutorLessonUsage.findUnique({ where: key });
  if (!lesson) {
    const started = await prisma.tutorLessonUsage.count({ where: { userId, day } });
    if (started >= DAILY_LESSON_LIMIT) {
      await undoTotal();
      return { ok: false, reason: "lessons" };
    }
    await prisma.tutorLessonUsage.create({ data: { userId, day, lessonId, count: 1 } });
    return { ok: true };
  }
  if (lesson.count >= LESSON_CALL_CAP) {
    await undoTotal();
    return { ok: false, reason: "lesson_cap" };
  }
  await prisma.tutorLessonUsage.update({ where: key, data: { count: { increment: 1 } } });
  return { ok: true };
}

/** Devuelve la llamada si la IA falló antes de responder. */
export async function refundCall(userId: string, lessonId: string) {
  const day = today();
  await prisma.tutorUsage.updateMany({
    where: { userId, day, count: { gt: 0 } },
    data: { count: { decrement: 1 } },
  });
  await prisma.tutorLessonUsage.updateMany({
    where: { userId, day, lessonId, count: { gt: 0 } },
    data: { count: { decrement: 1 } },
  });
}

// ── Perfil del alumno ──
export const ROLE_OPTIONS = [
  "Estudiante",
  "Ingeniero/a",
  "Residente o supervisor de obra",
  "Planner / programador",
  "Gerente de proyecto",
] as const;

export const EXPERIENCE_OPTIONS = [
  "Nunca gestioné proyectos",
  "Algo de experiencia",
  "Uso P6 o MS Project a menudo",
] as const;

export type Profile = { role: string; experience: string };

export function profileText(profile: Profile | null): string {
  if (!profile) return "No conocemos el perfil del alumno: usa ejemplos generales de ingeniería y construcción.";
  return `Perfil del alumno: ${profile.role}; experiencia en gestión de proyectos: ${profile.experience}.
Adapta el nivel y los ejemplos a este perfil (por ejemplo, un residente de obra entiende mejor ejemplos de campo;
alguien sin experiencia necesita palabras sencillas).`;
}

// ── Pregunta de comprobación ──
export type QuizOption = { text: string; correct: boolean; why: string };
export type Quiz = { question: string; options: QuizOption[] };

export function parseQuiz(json: string | null): Quiz | null {
  if (!json) return null;
  try {
    const q = JSON.parse(json);
    if (typeof q?.question !== "string" || !Array.isArray(q.options)) return null;
    return {
      question: q.question,
      options: q.options.map((o: QuizOption) => ({ text: String(o.text), correct: Boolean(o.correct), why: String(o.why ?? "") })),
    };
  } catch {
    return null;
  }
}

export type SlideContent = {
  title: string;
  bullets: string[];
  highlight: string | null;
  tutorNotes?: string | null;
};

export function parseBullets(json: string): string[] {
  try {
    const value = JSON.parse(json);
    return Array.isArray(value) ? value.map(String) : [];
  } catch {
    return [];
  }
}

type CourseOutline = {
  title: string;
  modules: { title: string; lessons: { title: string; slides: { title: string }[] }[] }[];
};

/**
 * Bloque estable del system prompt: rol del tutor + temario completo del curso.
 * No cambia entre preguntas del mismo curso, por eso se cachea.
 */
export function buildCoursePrompt(course: CourseOutline): string {
  const outline = course.modules
    .map(
      (m) =>
        `${m.title}\n` +
        m.lessons
          .map((l) => `  - Lección: ${l.title}\n` + l.slides.map((s) => `      · ${s.title}`).join("\n"))
          .join("\n")
    )
    .join("\n");

  return `Eres el tutor del curso "${course.title}" de Gantt Academy, una plataforma de cursos de ingeniería.
El curso tiene un contenido fijo en diapositivas y tú conduces cada lección como un tutor 1 a 1: explicas la
diapositiva adaptándote al alumno, das retroalimentación a sus respuestas y resuelves sus dudas. La plataforma
decide el orden de los pasos (explicar, preguntar, avanzar); tú sigues la instrucción de cada mensaje.

Cómo responder:
- Responde siempre en español, con un tono cercano y profesional.
- Sé breve: 2 a 6 frases, o una lista corta. Nada de introducciones largas.
- Basa tu respuesta en la diapositiva actual. Usa ejemplos de ingeniería y construcción cuando ayuden.
- Si la pregunta se aleja del tema de la diapositiva pero es del curso, respóndela en 1 o 2 frases y di en qué
  parte del temario se ve en detalle.
- Si la pregunta no tiene relación con la gestión de proyectos, dilo con amabilidad en una frase y vuelve a la
  diapositiva actual.
- No inventes contenido del curso que no esté en el temario. Si no sabes algo con certeza, dilo.
- No uses encabezados ni tablas. Puedes usar **negritas** y listas con "- ".
- Cuando el alumno hace una pregunta libre, termina con una frase corta que lo invite a volver a la lección.

Temario completo del curso:
${outline}`;
}

/** Bloque variable: la diapositiva que el alumno tiene en pantalla. */
export function buildSlidePrompt(
  lessonTitle: string,
  slideNumber: number,
  total: number,
  slide: SlideContent,
  profile: Profile | null = null
) {
  return `${profileText(profile)}

El alumno está en la lección "${lessonTitle}", diapositiva ${slideNumber} de ${total}.

Contenido de la diapositiva:
Título: ${slide.title}
${slide.bullets.map((b) => `- ${b}`).join("\n")}${slide.highlight ? `\nIdea clave: ${slide.highlight}` : ""}${
    slide.tutorNotes ? `\n\nNotas para el tutor (no las cites textualmente): ${slide.tutorNotes}` : ""
  }`;
}

export const ADAPT_STYLES = {
  simple: "más simple, como si se lo explicaras a alguien sin experiencia en proyectos, con palabras cotidianas",
  ejemplo: "con un ejemplo concreto de un proyecto de construcción o ingeniería que ilustre cada punto",
  detalle: "con más detalle técnico y profundidad, como para un profesional que quiere dominar el tema",
} as const;

export type AdaptStyle = keyof typeof ADAPT_STYLES;

export function buildAdaptRequest(style: AdaptStyle): string {
  return `Reescribe la diapositiva actual ${ADAPT_STYLES[style]}.
Mantén exactamente el mismo tema y las mismas ideas; no agregues temas nuevos.
Responde SOLO con la diapositiva, en este formato y sin ningún otro texto:
Título de la diapositiva
- punto 1
- punto 2
- punto 3
Idea clave: una frase final

Usa entre 3 y 5 puntos, de máximo 25 palabras cada uno.`;
}

export type Pace = "normal" | "rapido" | "pausado";

/** Paso "explicar": el tutor presenta la diapositiva actual al alumno. */
export function buildTeachRequest(pace: Pace, isFirstSlide: boolean): string {
  const length =
    pace === "rapido"
      ? "El alumno viene respondiendo bien: sé ágil, 2 a 4 frases, sin repetir lo básico."
      : pace === "pausado"
        ? "El alumno tuvo dificultades en la pregunta anterior: ve más despacio, 4 a 6 frases, con un ejemplo distinto y palabras sencillas."
        : "Usa 3 a 5 frases.";
  return `Explica al alumno la diapositiva actual, como su tutor.
${isFirstSlide ? "Es el inicio de la lección: salúdalo en una frase corta y dile de qué trata la lección.\n" : ""}- ${length}
- Incluye un ejemplo concreto relacionado con su perfil.
- Cubre las ideas de la diapositiva sin copiarla literalmente.
- No hagas preguntas de comprobación: la plataforma le mostrará una pregunta de opción múltiple después.
- Termina con una frase corta que lo invite a responder la pregunta de comprobación.`;
}

/** Paso "retroalimentación": el alumno eligió una opción de la pregunta de comprobación. */
export function buildFeedbackRequest(quiz: Quiz, chosenIndex: number, attempt: number): string {
  const chosen = quiz.options[chosenIndex];
  const correct = quiz.options.find((o) => o.correct)!;
  const listing = quiz.options
    .map((o) => `- ${o.text}${o.correct ? " (correcta)" : ""} — ${o.why}`)
    .join("\n");
  const header = `Pregunta de comprobación: ${quiz.question}
Opciones (información interna para ti):
${listing}

El alumno eligió: "${chosen.text}".`;

  if (chosen.correct) {
    return `${header}
Es la respuesta correcta. Felicítalo en pocas palabras y explica en 2 a 3 frases por qué es correcta,
conectándolo con su perfil. No repitas la pregunta.`;
  }
  if (attempt < 2) {
    return `${header}
Es incorrecta (primer intento). NO reveles cuál es la respuesta correcta y no la menciones.
En 2 a 3 frases, explica con amabilidad qué le falta a su elección y dale una pista que lo haga pensar,
usando la diapositiva. Termina invitándolo a intentarlo de nuevo.`;
  }
  return `${header}
Es incorrecta otra vez. Ahora sí revela la respuesta correcta: "${correct.text}". En 3 a 4 frases, explica por qué
es la correcta y por qué su opción no lo es, con un tono alentador. Termina diciendo que puede pasar a la
siguiente diapositiva.`;
}
