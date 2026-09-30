import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { z } from "zod";
import { canAccessCourse } from "@/lib/access";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  ADAPT_STYLES,
  DAILY_LESSON_LIMIT,
  TUTOR_MODEL,
  buildAdaptRequest,
  buildCoursePrompt,
  buildFeedbackRequest,
  buildSlidePrompt,
  buildTeachRequest,
  consumeCall,
  getAnthropic,
  isTutorConfigured,
  parseBullets,
  parseQuiz,
  refundCall,
  usageStatus,
} from "@/lib/tutor";

// Estado del tutor para el alumno: si está configurado y cuántas lecciones guiadas le quedan hoy
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Inicia sesión para usar el tutor IA" }, { status: 401 });
  }
  const lessonId = new URL(req.url).searchParams.get("lessonId") ?? undefined;
  const status = await usageStatus(session.user.id, lessonId);
  return NextResponse.json({
    configured: isTutorConfigured(),
    lessonsLeft: status.lessonsLeft,
    lessonStarted: status.lessonStarted,
    lessonLimit: DAILY_LESSON_LIMIT,
  });
}

const bodySchema = z.object({
  lessonId: z.string().min(1),
  slideId: z.string().min(1),
  mode: z.enum(["teach", "feedback", "chat", "adapt"]),
  style: z.enum(Object.keys(ADAPT_STYLES) as [keyof typeof ADAPT_STYLES]).optional(),
  pace: z.enum(["normal", "rapido", "pausado"]).default("normal"),
  chosenIndex: z.number().int().min(0).optional(),
  attempt: z.number().int().min(1).max(5).default(1),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000),
      })
    )
    .max(12)
    .default([]),
});

const LIMIT_MESSAGES = {
  lessons: `Ya empezaste ${DAILY_LESSON_LIMIT} lecciones guiadas hoy, el máximo diario. Puedes seguir con las lecciones que ya empezaste hoy, o volver mañana.`,
  lesson_cap: "Llegaste al máximo de interacciones con el tutor en esta lección por hoy. Puedes continuar mañana.",
  daily: "Llegaste al máximo de interacciones con el tutor por hoy. Vuelve mañana para seguir aprendiendo.",
};

// El tutor conduce la lección: explica la slide ("teach"), comenta la
// respuesta a la pregunta de comprobación ("feedback"), responde preguntas
// libres ("chat") o reescribe la slide en otro estilo ("adapt").
// La respuesta llega en streaming como texto plano.
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Inicia sesión para usar el tutor IA" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }
  const { lessonId, slideId, mode, style, pace, chosenIndex, attempt, messages } = parsed.data;
  if (mode === "chat" && messages.at(-1)?.role !== "user") {
    return NextResponse.json({ error: "Escribe una pregunta" }, { status: 400 });
  }
  if (mode === "adapt" && !style) {
    return NextResponse.json({ error: "Elige cómo quieres la explicación" }, { status: 400 });
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      slides: { orderBy: { order: "asc" } },
      module: {
        include: {
          course: {
            include: {
              modules: {
                orderBy: { order: "asc" },
                include: {
                  lessons: {
                    orderBy: { order: "asc" },
                    include: { slides: { orderBy: { order: "asc" }, select: { title: true } } },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
  const slideIndex = lesson?.slides.findIndex((s) => s.id === slideId) ?? -1;
  if (!lesson || slideIndex === -1) {
    return NextResponse.json({ error: "Diapositiva no encontrada" }, { status: 404 });
  }
  const slide = lesson.slides[slideIndex];

  const quiz = parseQuiz(slide.quiz);
  if (mode === "feedback" && (!quiz || chosenIndex === undefined || chosenIndex >= quiz.options.length)) {
    return NextResponse.json({ error: "Respuesta inválida" }, { status: 400 });
  }

  const course = lesson.module.course;
  const allowed =
    lesson.isFreePreview ||
    (await canAccessCourse(session.user.id, course, session.user.role));
  if (!allowed) {
    return NextResponse.json({ error: "No tienes acceso a este curso" }, { status: 403 });
  }

  if (!isTutorConfigured()) {
    return NextResponse.json(
      { error: "El tutor IA aún no está configurado. Falta ANTHROPIC_API_KEY en el archivo .env." },
      { status: 503 }
    );
  }

  const userId = session.user.id;
  const usage = await consumeCall(userId, lessonId);
  if (!usage.ok) {
    return NextResponse.json({ error: LIMIT_MESSAGES[usage.reason], reason: usage.reason }, { status: 429 });
  }

  const profile = await prisma.learnerProfile.findUnique({ where: { userId } });
  const system: Anthropic.Beta.BetaTextBlockParam[] = [
    { type: "text", text: buildCoursePrompt(course), cache_control: { type: "ephemeral" } },
    {
      type: "text",
      text: buildSlidePrompt(
        lesson.title,
        slideIndex + 1,
        lesson.slides.length,
        {
          title: slide.title,
          bullets: parseBullets(slide.bullets),
          highlight: slide.highlight,
          tutorNotes: slide.tutorNotes,
        },
        profile
      ),
    },
  ];

  let apiMessages: Anthropic.Beta.BetaMessageParam[];
  switch (mode) {
    case "teach":
      apiMessages = [{ role: "user", content: buildTeachRequest(pace, slideIndex === 0) }];
      break;
    case "feedback":
      apiMessages = [{ role: "user", content: buildFeedbackRequest(quiz!, chosenIndex!, attempt) }];
      break;
    case "adapt":
      apiMessages = [{ role: "user", content: buildAdaptRequest(style!) }];
      break;
    default:
      apiMessages = messages;
  }

  const stream = getAnthropic().beta.messages.stream({
    model: TUTOR_MODEL,
    max_tokens: 4000,
    output_config: { effort: "low" },
    // Si el modelo declina la solicitud, la API reintenta con un modelo de respaldo
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system,
    messages: apiMessages,
  });

  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      let wroteText = false;
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            wroteText = true;
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal" && !wroteText) {
          controller.enqueue(
            encoder.encode("No puedo ayudarte con esa pregunta. ¿Tienes alguna duda sobre esta diapositiva?")
          );
        }
      } catch (error) {
        if (!wroteText) await refundCall(userId, lessonId);
        controller.enqueue(encoder.encode(`\n\n⚠️ ${tutorErrorMessage(error)}`));
      } finally {
        controller.close();
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}

function tutorErrorMessage(error: unknown): string {
  if (error instanceof Anthropic.AuthenticationError) {
    return "La clave de la API de Claude no es válida. Revisa ANTHROPIC_API_KEY.";
  }
  if (error instanceof Anthropic.RateLimitError) {
    return "El tutor está recibiendo muchas preguntas. Intenta de nuevo en un minuto.";
  }
  if (error instanceof Anthropic.APIConnectionError) {
    return "No se pudo conectar con el tutor IA. Revisa tu conexión e intenta de nuevo.";
  }
  if (error instanceof Anthropic.APIError) {
    return "El tutor IA tuvo un problema al responder. Intenta de nuevo.";
  }
  return "Ocurrió un error inesperado con el tutor IA.";
}
