import Link from "next/link";

// Marca "G" de Gantt Academy: G en dos trazos (rojo + negro) con barras
// de diagrama de Gantt integradas, como el logo oficial
export function Logo({ withText = true }: { withText?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <svg viewBox="0 0 64 64" className="h-9 w-9" aria-hidden="true">
        <path
          d="M52 10H30C17.8 10 10 18.6 10 30v2h9v-2c0-7 4.6-11 11-11h22v-9z"
          fill="#C8102E"
        />
        <path d="M54 24v28H26v-9h19v-5H34v-9h20z" fill="#1E2430" />
        <rect x="12" y="38" width="12" height="5" fill="#C8102E" />
        <rect x="12" y="47" width="17" height="5" fill="#C8102E" />
        <rect x="7" y="36" width="3" height="18" fill="#1E2430" />
      </svg>
      {withText && (
        <span className="flex flex-col leading-none">
          <span className="text-lg font-bold tracking-[0.25em] text-ink">GANTT</span>
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
