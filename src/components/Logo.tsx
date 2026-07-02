import Link from "next/link";

// Marca "TA" inspirada en el logo de Turing Academy (negro + rojo)
export function Logo({ withText = true }: { withText?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <svg viewBox="0 0 48 48" className="h-9 w-9" aria-hidden="true">
        <path d="M6 8h20l-4 6h-5v26h-7V14H2z" fill="#1E2430" />
        <path d="M30 8h6l12 32h-7l-8-22-8 22h-7z" fill="#1E2430" />
        <path d="M33 30l-3.5 10h7z" fill="#C8102E" />
      </svg>
      {withText && (
        <span className="text-lg font-bold tracking-wide">
          TURING <span className="font-light text-neutral-500">ACADEMY</span>
        </span>
      )}
    </Link>
  );
}
