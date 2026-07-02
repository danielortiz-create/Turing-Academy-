import { createReadStream, statSync } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { canAccessCourse } from "@/lib/access";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const VIDEOS_DIR = path.join(process.cwd(), "storage", "videos");

// Transmite videos MP4 alojados en el servidor (storage/videos) con soporte
// de rangos HTTP, solo para usuarios con acceso al curso.
export async function GET(
  req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await params;
  const session = await auth();

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { module: { include: { course: true } } },
  });
  if (!lesson || lesson.videoProvider !== "MP4" || !lesson.videoRef) {
    return NextResponse.json({ error: "Video no encontrado" }, { status: 404 });
  }

  const allowed =
    lesson.isFreePreview ||
    (await canAccessCourse(session?.user?.id, lesson.module.course, session?.user?.role));
  if (!allowed) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  // Evita path traversal: solo el nombre base del archivo
  const filePath = path.join(VIDEOS_DIR, path.basename(lesson.videoRef));
  let fileSize: number;
  try {
    fileSize = statSync(filePath).size;
  } catch {
    return NextResponse.json({ error: "Archivo de video no disponible" }, { status: 404 });
  }

  const range = req.headers.get("range");
  if (range) {
    const match = /bytes=(\d+)-(\d*)/.exec(range);
    const start = match ? parseInt(match[1], 10) : 0;
    const end = match?.[2] ? parseInt(match[2], 10) : fileSize - 1;
    const stream = createReadStream(filePath, { start, end });
    return new Response(stream as unknown as ReadableStream, {
      status: 206,
      headers: {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": String(end - start + 1),
        "Content-Type": "video/mp4",
      },
    });
  }

  const stream = createReadStream(filePath);
  return new Response(stream as unknown as ReadableStream, {
    headers: {
      "Content-Length": String(fileSize),
      "Content-Type": "video/mp4",
      "Accept-Ranges": "bytes",
    },
  });
}
