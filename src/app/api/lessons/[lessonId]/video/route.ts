import { NextResponse } from "next/server";
import { canAccessCourse } from "@/lib/access";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// El reproductor pide aquí la URL del video. Solo se entrega si el usuario
// tiene acceso (compró el curso, es vista previa gratuita o es admin).
// Así la URL nunca aparece en el HTML público de la página.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await params;
  const session = await auth();

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { module: { include: { course: true } } },
  });
  if (!lesson) {
    return NextResponse.json({ error: "Lección no encontrada" }, { status: 404 });
  }

  const allowed =
    lesson.isFreePreview ||
    (await canAccessCourse(session?.user?.id, lesson.module.course, session?.user?.role));
  if (!allowed) {
    return NextResponse.json(
      { error: "Necesitas comprar el curso para ver esta lección" },
      { status: 403 }
    );
  }
  if (!lesson.videoRef) {
    return NextResponse.json({ error: "Esta lección aún no tiene video" }, { status: 404 });
  }

  let embedUrl: string;
  switch (lesson.videoProvider) {
    case "YOUTUBE":
      embedUrl = `https://www.youtube-nocookie.com/embed/${lesson.videoRef}?rel=0&modestbranding=1`;
      break;
    case "VIMEO":
      embedUrl = `https://player.vimeo.com/video/${lesson.videoRef}`;
      break;
    case "MP4":
      embedUrl = `/api/lessons/${lesson.id}/stream`;
      break;
  }

  return NextResponse.json({ provider: lesson.videoProvider, embedUrl });
}
