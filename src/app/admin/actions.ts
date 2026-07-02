"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Solo el administrador puede hacer esto");
  }
  return session;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createCourse(formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("El título es obligatorio");

  const priceUsd = parseFloat(String(formData.get("price") ?? "0")) || 0;
  const course = await prisma.course.create({
    data: {
      title,
      slug: `${slugify(title)}-${Date.now().toString(36)}`,
      subtitle: String(formData.get("subtitle") ?? "").trim() || null,
      description: String(formData.get("description") ?? "").trim(),
      priceCents: Math.round(priceUsd * 100),
    },
  });
  revalidatePath("/admin");
  redirect(`/admin/cursos/${course.id}`);
}

export async function updateCourse(courseId: string, formData: FormData) {
  await requireAdmin();
  const priceUsd = parseFloat(String(formData.get("price") ?? "0")) || 0;
  await prisma.course.update({
    where: { id: courseId },
    data: {
      title: String(formData.get("title") ?? "").trim(),
      subtitle: String(formData.get("subtitle") ?? "").trim() || null,
      description: String(formData.get("description") ?? "").trim(),
      priceCents: Math.round(priceUsd * 100),
      published: formData.get("published") === "on",
    },
  });
  revalidatePath("/admin");
  revalidatePath(`/admin/cursos/${courseId}`);
}

export async function deleteCourse(courseId: string) {
  await requireAdmin();
  await prisma.course.delete({ where: { id: courseId } });
  revalidatePath("/admin");
  redirect("/admin");
}

export async function createModule(courseId: string, formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const last = await prisma.module.findFirst({
    where: { courseId },
    orderBy: { order: "desc" },
  });
  await prisma.module.create({
    data: { courseId, title, order: (last?.order ?? 0) + 1 },
  });
  revalidatePath(`/admin/cursos/${courseId}`);
}

export async function deleteModule(moduleId: string, courseId: string) {
  await requireAdmin();
  await prisma.module.delete({ where: { id: moduleId } });
  revalidatePath(`/admin/cursos/${courseId}`);
}

export async function createLesson(moduleId: string, courseId: string, formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const provider = String(formData.get("videoProvider") ?? "YOUTUBE") as
    | "YOUTUBE"
    | "VIMEO"
    | "MP4";
  const last = await prisma.lesson.findFirst({
    where: { moduleId },
    orderBy: { order: "desc" },
  });
  await prisma.lesson.create({
    data: {
      moduleId,
      title,
      description: String(formData.get("description") ?? "").trim() || null,
      videoProvider: provider,
      videoRef: String(formData.get("videoRef") ?? "").trim() || null,
      durationMin: parseInt(String(formData.get("durationMin") ?? ""), 10) || null,
      isFreePreview: formData.get("isFreePreview") === "on",
      order: (last?.order ?? 0) + 1,
    },
  });
  revalidatePath(`/admin/cursos/${courseId}`);
}

export async function deleteLesson(lessonId: string, courseId: string) {
  await requireAdmin();
  await prisma.lesson.delete({ where: { id: lessonId } });
  revalidatePath(`/admin/cursos/${courseId}`);
}
