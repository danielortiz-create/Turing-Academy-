import Link from "next/link";

// Marca "G" de Gantt Academy: anillo en dos trazos (rojo arriba, negro abajo)
// con la barra de la G formada por barras de diagrama de Gantt
export function GMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      {/* Mitad superior de la G (rojo) */}
      <path
        d="M49.3 17.7 A22 22 0 0 0 10 32"
        fill="none"
        stroke="#C8102E"
        strokeWidth="9"
      />
      {/* Mitad inferior de la G (negro), termina abierta a la derecha */}
      <path
        d="M10 32 A22 22 0 0 0 51 42.5"
        fill="none"
        stroke="#1E2430"
        strokeWidth="9"
      />
      {/* Barras de Gantt que forman el travesaño de la G */}
      <rect x="28" y="28" width="14" height="6" fill="#C8102E" />
      <rect x="33" y="37" width="21" height="6" fill="#1E2430" />
    </svg>
  );
}

export function Logo({ withText = true }: { withText?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2 sm:gap-2.5">
      <GMark />
      {withText && (
        <span className="flex flex-col leading-none">
          <span className="text-lg font-bold tracking-[0.18em] text-ink sm:tracking-[0.25em]">GANTT</span>
          <span className="mt-1 flex items-center gap-1.5 text-[9px] font-semibold tracking-[0.35em] text-brand">
            <span className="h-px w-3 bg-brand" aria-hidden="true" />
            ACADEMY
            <span className="h-px w-3 bg-brand" aria-hidden="true" />
          </span>
        </span>
      )}
    </Link>
  );
}
