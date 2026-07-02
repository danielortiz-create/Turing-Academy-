import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Providers } from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Gantt Academy — Cursos de ingeniería",
    template: "%s | Gantt Academy",
  },
  description:
    "Cursos en línea de ingeniería: Primavera P6, planificación y control de proyectos.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Providers>
          <Navbar />
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
          <footer className="border-t border-neutral-200 bg-white py-8">
            <div className="mx-auto max-w-6xl px-4 text-center text-sm text-neutral-500">
              © {new Date().getFullYear()} Gantt Academy · Cursos de ingeniería
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
