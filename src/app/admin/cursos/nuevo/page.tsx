import { redirect } from "next/navigation";
import { createCourse } from "@/app/admin/actions";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata = { title: "Nuevo curso" };

export default async function NewCoursePage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/");

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold">Nuevo curso</h1>
      <form action={createCourse} className="card mt-8 space-y-5 p-6">
        <div>
          <label className="mb-1 block text-sm font-medium">Título *</label>
          <input name="title" required className="input" placeholder="Primavera P6 avanzado" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Subtítulo</label>
          <input name="subtitle" className="input" placeholder="Frase corta que describe el curso" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Descripción</label>
          <textarea name="description" rows={5} className="input" placeholder="Qué aprenderá el estudiante…" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Precio (USD)</label>
          <input name="price" type="number" step="0.01" min="0" defaultValue="49" className="input" />
          <p className="mt-1 text-xs text-neutral-500">Usa 0 para un curso gratuito.</p>
        </div>
        <button type="submit" className="btn-primary w-full">
          Crear curso
        </button>
      </form>
    </div>
  );
}
