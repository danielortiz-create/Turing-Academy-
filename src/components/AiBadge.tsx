// Etiqueta para cursos cuyo contenido fue generado con IA
export function AiBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-ink/15 bg-ink/5 px-2.5 py-0.5 text-xs font-semibold text-ink ${className}`}
    >
      <svg viewBox="0 0 16 16" className="h-3 w-3 text-brand" fill="currentColor" aria-hidden="true">
        <path d="M8 0l1.8 5.2L15 7l-5.2 1.8L8 14l-1.8-5.2L1 7l5.2-1.8z" />
      </svg>
      Generado con IA
    </span>
  );
}
