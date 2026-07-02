"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Logo } from "@/components/Logo";

export function Navbar() {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-neutral-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4">
        <Logo />
        <nav className="flex items-center gap-3 sm:gap-5">
          <Link href="/cursos" className="text-sm font-medium hover:text-brand">
            Cursos
          </Link>
          {session?.user && (
            <Link href="/mis-cursos" className="text-sm font-medium hover:text-brand">
              Mis cursos
            </Link>
          )}
          {session?.user?.role === "ADMIN" && (
            <Link href="/admin" className="text-sm font-medium hover:text-brand">
              Admin
            </Link>
          )}
          {status === "loading" ? (
            <div className="h-9 w-24 animate-pulse rounded-lg bg-neutral-200" />
          ) : session?.user ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-neutral-500 sm:inline">
                {session.user.name ?? session.user.email}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="btn-secondary !px-3 !py-1.5 text-sm"
              >
                Salir
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="btn-secondary !px-3 !py-1.5 text-sm">
                Entrar
              </Link>
              <Link href="/registro" className="btn-primary !px-3 !py-1.5 text-sm">
                Crear cuenta
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
