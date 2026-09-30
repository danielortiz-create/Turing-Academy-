import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { z } from "zod";
import { canAccessCourse } from "@/lib/access";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  ADAPT_STYLES,
  DAILY_LIMIT,
  TUTOR_MODEL,
  buildAdaptRequest,
  buildCoursePrompt,
  buildSlidePrompt,
  consumeQuestion,
  getAnthropic,
  isTutorConfigured,
  parseBullets,
  questionsLeft,
  refundQuestion,
} from "@/lib/tutor";

// Estado del tutor para el alumno: si está configurado y cuántas preguntas le quedan hoy
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Inicia sesión para usar el tutor IA" }, { status: 401 });
  }
  return NextResponse.json({
    configured: isTutorConfigured(),
    left: await questionsLeft(session.user.id),
    limit: DAILY_LIMIT,
  });
}

const bodySchema = z.object({
  lessonId: z.string().min(1),
  slideId: z.string().min(1),
  mode: z.enum(["chat", "adapt"]),
  style: z.enum(Object.keys(ADAPT_STYLES) as [keyof typeof ADAPT_STYLES]).optional(),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(2000),
      })
    )
    .max(12)
    .default([]),
});

// El alumno pregunta sobre la slide actual (mode "chat") o pide verla
// explicada de otra forma (mode "adapt"). La respuesta llega en streaming
// como texto plano.
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Inicia sesión para usar el tutor IA" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }
  const { lessonId, slideId, mode, style, messages } = parsed.data;
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
  if (!(await consumeQuestion(userId))) {
    return NextResponse.json(
      { error: `Llegaste al límite de ${DAILY_LIMIT} preguntas por hoy. Vuelve mañana para seguir preguntando.` },
      { status: 429 }
    );
  }

  const slide = lesson.slides[slideIndex];
  const system: Anthropic.Beta.BetaTextBlockParam[] = [
    { type: "text", text: buildCoursePrompt(course), cache_control: { type: "ephemeral" } },
    {
      type: "text",
      text: buildSlidePrompt(lesson.title, slideIndex + 1, lesson.slides.length, {
        title: slide.title,
        bullets: parseBullets(slide.bullets),
        highlight: slide.highlight,
        tutorNotes: slide.tutorNotes,
      }),
    },
  ];
  const apiMessages: Anthropic.Beta.BetaMessageParam[] =
    mode === "adapt" ? [{ role: "user", content: buildAdaptRequest(style!) }] : messages;

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
        if (!wroteText) await refundQuestion(userId);
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
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Questions-Left": String(await questionsLeft(userId)),
    },
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
