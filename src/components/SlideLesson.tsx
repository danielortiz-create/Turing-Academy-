"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { RichText } from "@/components/RichText";

export type LessonSlide = {
  id: string;
  title: string;
  bullets: string[];
  highlight: string | null;
};

type Style = "simple" | "ejemplo" | "detalle";

const STYLE_LABELS: Record<Style, string> = {
  simple: "Explícalo más simple",
  ejemplo: "Dame un ejemplo",
  detalle: "Más detalle",
};

type ChatItem =
  | { kind: "user" | "assistant"; text: string; error?: boolean }
  | { kind: "divider"; text: string };

type TutorStatus = { configured: boolean; left: number; limit: number } | null;

// Convierte la respuesta de "adaptar" (título, viñetas "- ", "Idea clave:")
// en una slide. Funciona también con texto parcial mientras llega en streaming.
function parseAdapted(text: string, fallbackTitle: string): Omit<LessonSlide, "id"> {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  let title = "";
  const bullets: string[] = [];
  let highlight: string | null = null;
  for (const line of lines) {
    if (/^idea clave:/i.test(line)) highlight = line.replace(/^idea clave:\s*/i, "");
    else if (/^[-•*]\s+/.test(line)) bullets.push(line.replace(/^[-•*]\s+/, ""));
    else if (!title) title = line.replace(/^#+\s*/, "").replace(/\*\*/g, "");
  }
  return { title: title || fallbackTitle, bullets, highlight };
}

function storageKey(lessonId: string) {
  return `tutor-chat:${lessonId}`;
}

export function SlideLesson({
  lessonId,
  lessonTitle,
  slides,
  isLoggedIn,
  nextLessonHref,
}: {
  lessonId: string;
  lessonTitle: string;
  slides: LessonSlide[];
  isLoggedIn: boolean;
  nextLessonHref: string | null;
}) {
  const [index, setIndex] = useState(0);
  const [items, setItems] = useState<ChatItem[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<TutorStatus>(null);
  // Versiones adaptadas por IA, por slide y estilo: "slideId:estilo" -> texto
  const [adapted, setAdapted] = useState<Record<string, string>>({});
  const [activeStyle, setActiveStyle] = useState<Style | null>(null);
  const [adaptError, setAdaptError] = useState<string | null>(null);
  const chatBox = useRef<HTMLDivElement>(null);

  const slide = slides[index];
  const isLast = index === slides.length - 1;
  const adaptedKey = activeStyle ? `${slide.id}:${activeStyle}` : null;
  const adaptedText = adaptedKey ? adapted[adaptedKey] : undefined;
  const shown = adaptedText !== undefined ? { ...parseAdapted(adaptedText, slide.title) } : slide;

  // Historial del chat por lección (solo en esta pestaña)
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(storageKey(lessonId));
      if (saved) setItems(JSON.parse(saved));
    } catch {
      /* sin almacenamiento disponible: el chat empieza vacío */
    }
  }, [lessonId]);

  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey(lessonId), JSON.stringify(items.slice(-40)));
    } catch {
      /* ignorar */
    }
    // Desplaza solo el panel del chat, nunca la página completa
    const box = chatBox.current;
    if (box) box.scrollTop = box.scrollHeight;
  }, [items, lessonId]);

  const refreshStatus = useCallback(() => {
    fetch("/api/tutor")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data && setStatus(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isLoggedIn) refreshStatus();
  }, [isLoggedIn, refreshStatus]);

  const goTo = useCallback(
    (next: number) => {
      if (next < 0 || next >= slides.length || next === index) return;
      setIndex(next);
      setActiveStyle(null);
      setAdaptError(null);
      // Marca en el chat el cambio de slide, para que la conversación tenga contexto
      setItems((prev) =>
        prev.some((i) => i.kind !== "divider")
          ? [...prev, { kind: "divider", text: `Diapositiva ${next + 1} · ${slides[next].title}` }]
          : prev
      );
    },
    [index, slides]
  );

  // Flechas del teclado para moverse entre slides (salvo mientras se escribe)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      if (e.key === "ArrowRight") goTo(index + 1);
      if (e.key === "ArrowLeft") goTo(index - 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo, index]);

  async function callTutor(
    payload: Record<string, unknown>,
    onText: (text: string) => void
  ): Promise<string | null> {
    const res = await fetch("/api/tutor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId, slideId: slide.id, ...payload }),
    });
    if (!res.ok || !res.body) {
      const data = await res.json().catch(() => ({}));
      if (res.status === 429) refreshStatus();
      return data.error ?? "El tutor no pudo responder. Intenta de nuevo.";
    }
    const left = res.headers.get("X-Questions-Left");
    if (left !== null) setStatus((s) => (s ? { ...s, left: Number(left) } : s));

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let text = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      text += decoder.decode(value, { stream: true });
      onText(text);
    }
    // El servidor devuelve la pregunta al contador si la IA falló
    if (text.includes("⚠️")) refreshStatus();
    // Falló antes de escribir nada: tratarlo como error, no como respuesta
    if (text.trim().startsWith("⚠️")) return text.replace("⚠️", "").trim();
    return null;
  }

  async function ask(question: string) {
    const q = question.trim();
    if (!q || busy) return;
    setInput("");
    setBusy(true);

    // Historial para la API: solo mensajes reales, empezando por una pregunta
    const history = [...items, { kind: "user" as const, text: q }]
      .filter((i): i is { kind: "user" | "assistant"; text: string; error?: boolean } =>
        i.kind !== "divider" && !("error" in i && i.error)
      )
      .slice(-10);
    const firstUser = history.findIndex((i) => i.kind === "user");
    const messages = history.slice(firstUser).map((i) => ({ role: i.kind, content: i.text }));

    setItems((prev) => [...prev, { kind: "user", text: q }, { kind: "assistant", text: "" }]);
    const setLast = (patch: Partial<{ text: string; error: boolean }>) =>
      setItems((prev) => {
        const copy = [...prev];
        const last = copy[copy.length - 1];
        if (last && last.kind === "assistant") copy[copy.length - 1] = { ...last, ...patch };
        return copy;
      });

    try {
      const error = await callTutor({ mode: "chat", messages }, (text) => setLast({ text }));
      if (error) setLast({ text: error, error: true });
    } catch {
      setLast({ text: "Error de conexión con el tutor.", error: true });
    } finally {
      setBusy(false);
    }
  }

  async function adapt(style: Style) {
    if (busy) return;
    setAdaptError(null);
    setActiveStyle(style);
    const key = `${slide.id}:${style}`;
    if (adapted[key]) return; // ya generada: mostrarla sin gastar otra pregunta
    setBusy(true);
    try {
      const error = await callTutor({ mode: "adapt", style }, (text) =>
        setAdapted((prev) => ({ ...prev, [key]: text }))
      );
      if (error) {
        setAdaptError(error);
        setActiveStyle(null);
        setAdapted((prev) => {
          const copy = { ...prev };
          delete copy[key];
          return copy;
        });
      }
    } catch {
      setAdaptError("Error de conexión con el tutor.");
      setActiveStyle(null);
    } finally {
      setBusy(false);
    }
  }

  const lastItem = items.at(-1);
  const showContinue = !busy && lastItem?.kind === "assistant" && !lastItem.error && lastItem.text;
  const tutorReady = isLoggedIn && status?.configured !== false;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      {/* ── Visor de slides ── */}
      <div>
        <div className="relative flex min-h-[420px] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_18px_40px_-18px_rgba(30,36,48,0.25)] lg:aspect-[16/10] lg:min-h-0">
          {adaptedText !== undefined && activeStyle && (
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/10 bg-ink/[0.03] px-6 py-2 text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-ink">
                <svg viewBox="0 0 16 16" className="h-3 w-3 text-brand" fill="currentColor" aria-hidden="true">
                  <path d="M8 0l1.8 5.2L15 7l-5.2 1.8L8 14l-1.8-5.2L1 7l5.2-1.8z" />
                </svg>
                Versión adaptada por IA · {STYLE_LABELS[activeStyle]}
              </span>
              <button
                onClick={() => setActiveStyle(null)}
                className="font-semibold text-brand hover:underline"
              >
                Volver al original
              </button>
            </div>
          )}

          <div className="flex flex-1 flex-col px-6 py-7 sm:px-10 sm:py-9">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
              {lessonTitle} · {index + 1} / {slides.length}
            </p>
            <h2 className="mt-3 text-2xl font-bold leading-tight text-ink [text-wrap:balance] sm:text-[1.9rem]">
              {shown.title}
            </h2>
            <ul className="mt-6 space-y-3.5">
              {shown.bullets.map((b, i) => (
                <li key={i} className="flex gap-3 text-[15.5px] leading-relaxed text-neutral-700 sm:text-[17px]">
                  <span className="mt-[0.6em] h-2 w-2 shrink-0 rounded-[2px] bg-brand" aria-hidden="true" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            {shown.highlight && (
              <p className="mt-auto rounded-xl bg-brand/[0.06] px-5 py-4 text-[15px] font-medium text-ink">
                <span className="mr-1.5 font-bold text-brand">Idea clave:</span>
                {shown.highlight}
              </p>
            )}
          </div>
        </div>

        {/* Controles */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => goTo(index - 1)}
              disabled={index === 0}
              className="btn-secondary !px-4 disabled:opacity-40"
              aria-label="Diapositiva anterior"
            >
              ←
            </button>
            <div className="flex gap-1.5 px-1" aria-hidden="true">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  tabIndex={-1}
                  onClick={() => goTo(i)}
                  className={`h-2 rounded-full transition-all ${i === index ? "w-6 bg-brand" : "w-2 bg-neutral-300 hover:bg-neutral-400"}`}
                />
              ))}
            </div>
            {isLast ? (
              nextLessonHref ? (
                <Link href={nextLessonHref} className="btn-primary">
                  Siguiente lección →
                </Link>
              ) : null
            ) : (
              <button onClick={() => goTo(index + 1)} className="btn-primary">
                Siguiente →
              </button>
            )}
          </div>
        </div>

        {/* Adaptar la explicación */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-neutral-500">¿No quedó claro?</span>
          {(Object.keys(STYLE_LABELS) as Style[]).map((style) => (
            <button
              key={style}
              onClick={() => adapt(style)}
              disabled={!tutorReady || busy}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                activeStyle === style && adaptedText !== undefined
                  ? "border-brand bg-brand text-white"
                  : "border-neutral-300 bg-white text-ink hover:border-brand hover:text-brand"
              }`}
            >
              {STYLE_LABELS[style]}
            </button>
          ))}
        </div>
        {busy && activeStyle && adaptedText === undefined && (
          <p className="mt-2 animate-pulse text-sm text-neutral-500">Adaptando la diapositiva…</p>
        )}
        {adaptError && <p className="mt-2 text-sm text-brand">{adaptError}</p>}
      </div>

      {/* ── Tutor IA ── */}
      <aside className="flex h-[560px] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)] lg:max-h-[680px]">
        <div className="flex items-center justify-between gap-2 border-b border-neutral-200 px-4 py-3">
          <div>
            <p className="font-semibold text-ink">Tutor IA</p>
            <p className="text-xs text-neutral-500">Pregunta sobre esta diapositiva</p>
          </div>
          {status?.configured && (
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums ${
                status.left > 3 ? "bg-neutral-100 text-neutral-600" : "bg-amber-100 text-amber-800"
              }`}
            >
              {status.left}/{status.limit} hoy
            </span>
          )}
        </div>

        <div ref={chatBox} className="flex-1 space-y-4 overflow-y-auto px-4 py-4 text-[14.5px] leading-relaxed">
          {!isLoggedIn ? (
            <div className="rounded-xl bg-neutral-50 p-4 text-neutral-600">
              <p>Inicia sesión para preguntarle al tutor y pedirle que te explique las diapositivas de otra forma.</p>
              <Link href="/login" className="btn-primary mt-3 w-full">
                Iniciar sesión
              </Link>
            </div>
          ) : status?.configured === false ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
              El tutor IA aún no está configurado. El administrador debe agregar{" "}
              <code className="rounded bg-amber-100 px-1">ANTHROPIC_API_KEY</code> en el archivo{" "}
              <code className="rounded bg-amber-100 px-1">.env</code>. Mientras tanto, puedes seguir la lección.
            </div>
          ) : items.length === 0 ? (
            <div className="space-y-3 text-neutral-600">
              <p>
                Hola 👋 Soy tu tutor para este curso. Si algo de la diapositiva no te queda claro, pregúntame.
                Cuando termines, seguimos con la lección.
              </p>
              <div className="flex flex-col gap-2">
                {["¿Por qué es importante esto?", "¿Cómo se aplica en una obra real?"].map((q) => (
                  <button
                    key={q}
                    onClick={() => ask(q)}
                    className="rounded-lg border border-neutral-200 px-3 py-2 text-left text-sm text-ink transition hover:border-brand hover:text-brand"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            items.map((item, i) =>
              item.kind === "divider" ? (
                <p
                  key={i}
                  className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-400 before:h-px before:flex-1 before:bg-neutral-200 after:h-px after:flex-1 after:bg-neutral-200"
                >
                  {item.text}
                </p>
              ) : item.kind === "user" ? (
                <div key={i} className="ml-8 rounded-2xl rounded-br-md bg-ink px-4 py-2.5 text-white">
                  {item.text}
                </div>
              ) : (
                <div
                  key={i}
                  className={`mr-4 rounded-2xl rounded-bl-md px-4 py-2.5 ${
                    item.error ? "bg-brand/5 text-brand" : "bg-neutral-100 text-ink"
                  }`}
                >
                  {item.text ? (
                    <RichText text={item.text} />
                  ) : (
                    <span className="animate-pulse text-neutral-400">Pensando…</span>
                  )}
                </div>
              )
            )
          )}
          {showContinue && (
            <div className="flex justify-start">
              {isLast ? (
                nextLessonHref && (
                  <Link href={nextLessonHref} className="btn-primary !py-2 text-sm">
                    Ir a la siguiente lección →
                  </Link>
                )
              ) : (
                <button onClick={() => goTo(index + 1)} className="btn-primary !py-2 text-sm">
                  Continuar con la lección →
                </button>
              )}
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(input);
          }}
          className="flex gap-2 border-t border-neutral-200 p-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={2000}
            disabled={!tutorReady || busy}
            placeholder={tutorReady ? "Escribe tu pregunta…" : "Tutor no disponible"}
            className="input !py-2 text-sm"
            aria-label="Pregunta para el tutor"
          />
          <button
            type="submit"
            disabled={!tutorReady || busy || !input.trim()}
            className="btn-primary !px-4 !py-2 text-sm"
          >
            Enviar
          </button>
        </form>
      </aside>
    </div>
  );
}
