import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";

// Preguntas al tutor IA permitidas por alumno y día (incluye "explícalo de otra forma")
export const DAILY_LIMIT = 20;

export const TUTOR_MODEL = "claude-opus-5-5";

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

export async function questionsLeft(userId: string): Promise<number> {
  const usage = await prisma.tutorUsage.findUnique({
    where: { userId_day: { userId, day: today() } },
  });
  return Math.max(0, DAILY_LIMIT - (usage?.count ?? 0));
}

/** Descuenta una pregunta del día. Devuelve false si ya se alcanzó el límite. */
export async function consumeQuestion(userId: string): Promise<boolean> {
  const day = today();
  const usage = await prisma.tutorUsage.upsert({
    where: { userId_day: { userId, day } },
    update: { count: { increment: 1 } },
    create: { userId, day, count: 1 },
  });
  if (usage.count > DAILY_LIMIT) {
    await refundQuestion(userId);
    return false;
  }
  return true;
}

/** Devuelve la pregunta si la llamada a la IA falló por un error nuestro o de la API. */
export async function refundQuestion(userId: string) {
  await prisma.tutorUsage.updateMany({
    where: { userId, day: today(), count: { gt: 0 } },
    data: { count: { decrement: 1 } },
  });
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
El curso tiene un contenido fijo en diapositivas. Tu trabajo es ayudar al alumno a entender la diapositiva
que está viendo y luego devolverlo a la lección.

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
- Termina con una frase corta que invite a continuar con la lección o a preguntar otra duda.

Temario completo del curso:
${outline}`;
}

/** Bloque variable: la diapositiva que el alumno tiene en pantalla. */
export function buildSlidePrompt(lessonTitle: string, slideNumber: number, total: number, slide: SlideContent) {
  return `El alumno está en la lección "${lessonTitle}", diapositiva ${slideNumber} de ${total}.

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
