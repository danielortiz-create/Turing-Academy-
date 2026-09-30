"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { QuizCard, emptyQuizState, shuffledOrder, type Quiz, type QuizState } from "@/components/QuizCard";
import { RichText } from "@/components/RichText";

export type GuidedSlide = {
  id: string;
  title: string;
  bullets: string[];
  highlight: string | null;
  quiz: Quiz | null;
};

type Profile = { role: string; experience: string };
type Pace = "normal" | "rapido" | "pausado";
type Style = "simple" | "ejemplo" | "detalle";
type Phase = "profile" | "teaching" | "quiz" | "answered" | "done";

type Item =
  | { kind: "tutor"; text: string; error?: boolean; offline?: boolean }
  | { kind: "user"; text: string }
  | { kind: "quiz"; slide: number }
  | { kind: "divider"; text: string }
  | { kind: "profile" };

type Saved = {
  items: Item[];
  index: number;
  phase: Phase;
  quizzes: Record<number, QuizState>;
  pace: Pace;
};

const STYLE_LABELS: Record<Style, string> = {
  simple: "Explícalo más simple",
  ejemplo: "Dame un ejemplo",
  detalle: "Más detalle",
};

const ROLE_OPTIONS = [
  "Estudiante",
  "Ingeniero/a",
  "Residente o supervisor de obra",
  "Planner / programador",
  "Gerente de proyecto",
];
const EXPERIENCE_OPTIONS = ["Nunca gestioné proyectos", "Algo de experiencia", "Uso P6 o MS Project a menudo"];

// Convierte la respuesta de "adaptar" (título, viñetas "- ", "Idea clave:") en una slide.
function parseAdapted(text: string, fallbackTitle: string) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  let title = "";
  const bullets: string[] = [];
  let highlight: string | null = null;
  for (const line of lines) {
    if (/^idea clave:/i.test(line)) highlight = line.replace(/^idea clave:\s*/i, "");
    else if (/^[-•*]\s+/.test(line)) bullets.push(line.replace(/^[-•*]\s+/, "").replace(/\*\*/g, ""));
    else if (!title) title = line.replace(/^#+\s*/, "").replace(/\*\*/g, "");
  }
  return { title: title || fallbackTitle, bullets, highlight };
}

// Explicación sin IA: el contenido fijo de la slide en forma de mensaje del tutor
function staticExplanation(slide: GuidedSlide) {
  return (
    `Esta diapositiva trata de **${slide.title}**:\n` +
    slide.bullets.map((b) => `- ${b}`).join("\n") +
    (slide.highlight ? `\n\n**Idea clave:** ${slide.highlight}` : "")
  );
}

function staticFeedback(quiz: Quiz, chosen: number, attempt: number) {
  const option = quiz.options[chosen];
  const correct = quiz.options.find((o) => o.correct)!;
  if (option.correct) return `**¡Correcto!** ${option.why}`;
  if (attempt < 2) return `No es la mejor opción: ${option.why} Inténtalo de nuevo.`;
  return `La respuesta correcta es **${correct.text}**. ${correct.why}`;
}

function storageKey(lessonId: string) {
  return `guided-lesson:${lessonId}`;
}

export function GuidedLesson({
  lessonId,
  lessonTitle,
  slides,
  isLoggedIn,
  initialProfile,
  nextLessonHref,
}: {
  lessonId: string;
  lessonTitle: string;
  slides: GuidedSlide[];
  isLoggedIn: boolean;
  initialProfile: Profile | null;
  nextLessonHref: string | null;
}) {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [index, setIndex] = useState(0); // slide que el tutor está enseñando
  const [viewIndex, setViewIndex] = useState(0); // slide visible (puede repasar anteriores)
  const [phase, setPhase] = useState<Phase>("teaching");
  const [quizzes, setQuizzes] = useState<Record<number, QuizState>>({});
  const [pace, setPace] = useState<Pace>("normal");
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [busy, setBusy] = useState(false);
  const [offline, setOffline] = useState(!isLoggedIn); // sin IA: contenido fijo
  const [chatReturn, setChatReturn] = useState(false); // mostrar "Volver a la lección"
  const [input, setInput] = useState("");
  const [adapted, setAdapted] = useState<Record<string, string>>({});
  const [activeStyle, setActiveStyle] = useState<Style | null>(null);
  const [adaptNote, setAdaptNote] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  const append = useCallback((...next: Item[]) => setItems((prev) => [...prev, ...next]), []);
  const patchLast = useCallback(
    (patch: Partial<{ text: string; error: boolean; offline: boolean }>) =>
      setItems((prev) => {
        const copy = [...prev];
        const last = copy[copy.length - 1];
        if (last?.kind === "tutor") copy[copy.length - 1] = { ...last, ...patch };
        return copy;
      }),
    []
  );

  // ── Llamada al tutor con streaming. Devuelve el texto o null si falló. ──
  const callTutor = useCallback(
    async (payload: Record<string, unknown>, onText: (text: string) => void): Promise<string | { error: string; fatal: boolean }> => {
      let res: Response;
      try {
        res = await fetch("/api/tutor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lessonId, ...payload }),
        });
      } catch {
        return { error: "Error de conexión con el tutor.", fatal: false };
      }
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        // Sin clave (503), sin sesión (401), sin acceso (403) o límite diario (429):
        // la lección sigue con el contenido fijo
        const fatal = [401, 403, 429, 503].includes(res.status);
        return { error: data.error ?? "El tutor no pudo responder.", fatal };
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let text = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        onText(text);
      }
      if (text.trim().startsWith("⚠️")) return { error: text.replace("⚠️", "").trim(), fatal: false };
      return text;
    },
    [lessonId]
  );

  // ── Paso: explicar la slide `i` ──
  const teach = useCallback(
    async (i: number, currentPace: Pace, forceOffline = offline) => {
      const slide = slides[i];
      setPhase("teaching");
      if (forceOffline) {
        append({ kind: "tutor", text: staticExplanation(slide), offline: true });
      } else {
        setBusy(true);
        append({ kind: "tutor", text: "" });
        const result = await callTutor({ slideId: slide.id, mode: "teach", pace: currentPace }, (text) =>
          patchLast({ text })
        );
        setBusy(false);
        if (typeof result !== "string") {
          patchLast({ text: result.error, error: true });
          if (result.fatal) setOffline(true);
          append({ kind: "tutor", text: staticExplanation(slide), offline: true });
        }
      }
      if (slide.quiz) {
        append({ kind: "quiz", slide: i });
        setPhase("quiz");
      } else {
        setPhase("answered");
      }
    },
    [append, callTutor, offline, patchLast, slides]
  );

  // ── Restaurar o empezar la lección ──
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    try {
      const raw = sessionStorage.getItem(storageKey(lessonId));
      if (raw) {
        const saved: Saved = JSON.parse(raw);
        if (saved.phase !== "teaching" && saved.phase !== "profile" && saved.items.length) {
          setItems(saved.items);
          setIndex(saved.index);
          setViewIndex(saved.index);
          setPhase(saved.phase);
          setQuizzes(saved.quizzes);
          setPace(saved.pace);
          setReady(true);
          return;
        }
      }
    } catch {
      /* sin almacenamiento: empezar de cero */
    }
    setReady(true);
    if (!isLoggedIn) {
      teach(0, "normal", true);
      return;
    }
    // ¿Está disponible el tutor para esta lección hoy?
    fetch(`/api/tutor?lessonId=${encodeURIComponent(lessonId)}`)
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null)
      .then((status) => {
        const noKey = !status?.configured;
        const limitReached = status && status.lessonsLeft === 0 && !status.lessonStarted;
        if (noKey || limitReached) {
          setOffline(true);
          if (limitReached) {
            append({
              kind: "tutor",
              text: `Hoy ya empezaste ${status.lessonLimit} lecciones guiadas, el máximo diario. Esta lección sigue con el contenido del curso; mañana el tutor vuelve a estar disponible.`,
              error: true,
            });
          }
          teach(0, "normal", true);
        } else if (!initialProfile) {
          append(
            {
              kind: "tutor",
              text: `Hola 👋 Soy tu tutor en **${lessonTitle}**. Te voy a explicar cada diapositiva y a hacerte una pregunta corta para comprobar que quedó clara. Antes, cuéntame un poco de ti para adaptar los ejemplos:`,
            },
            { kind: "profile" }
          );
          setPhase("profile");
        } else {
          teach(0, "normal", false);
        }
      });
  }, [append, initialProfile, isLoggedIn, lessonId, lessonTitle, teach]);

  // Guardar el avance (solo en esta pestaña) y desplazar el hilo
  useEffect(() => {
    if (!ready) return;
    try {
      const saved: Saved = { items: items.slice(-60), index, phase, quizzes, pace };
      sessionStorage.setItem(storageKey(lessonId), JSON.stringify(saved));
    } catch {
      /* ignorar */
    }
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [items, index, phase, quizzes, pace, lessonId, ready]);

  // ── Perfil ──
  async function saveProfile(next: Profile) {
    setProfile(next);
    setItems((prev) => prev.filter((i) => i.kind !== "profile"));
    append({ kind: "user", text: `${next.role} · ${next.experience}` });
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    }).catch(() => null);
    if (!res?.ok) append({ kind: "tutor", text: "No pude guardar tu perfil, pero seguimos igual.", error: true });
    if (phase === "profile") teach(index, pace, false);
  }

  // ── Respuesta a la pregunta de comprobación ──
  async function answer(originalIndex: number) {
    const slide = slides[index];
    const quiz = slide.quiz;
    if (!quiz || busy) return;
    const prev = quizzes[index] ?? emptyQuizState;
    const attempt = prev.chosen.length + 1;
    const correct = quiz.options[originalIndex].correct;
    const nextState: QuizState = {
      chosen: [...prev.chosen, originalIndex],
      solved: correct,
      revealed: !correct && attempt >= 2,
    };
    setQuizzes((q) => ({ ...q, [index]: nextState }));
    append({ kind: "user", text: quiz.options[originalIndex].text });

    if (offline) {
      append({ kind: "tutor", text: staticFeedback(quiz, originalIndex, attempt), offline: true });
    } else {
      setBusy(true);
      append({ kind: "tutor", text: "" });
      const result = await callTutor(
        { slideId: slide.id, mode: "feedback", chosenIndex: originalIndex, attempt },
        (text) => patchLast({ text })
      );
      setBusy(false);
      if (typeof result !== "string") {
        patchLast({ text: staticFeedback(quiz, originalIndex, attempt), offline: true });
        if (result.fatal) setOffline(true);
      }
    }

    if (nextState.solved || nextState.revealed) {
      setPhase("answered");
      setPace(correct && attempt === 1 ? "rapido" : attempt >= 2 ? "pausado" : "normal");
    }
  }

  // ── Avanzar ──
  async function next() {
    if (busy) return;
    setChatReturn(false);
    if (index < slides.length - 1) {
      const i = index + 1;
      setIndex(i);
      setViewIndex(i);
      setActiveStyle(null);
      append({ kind: "divider", text: `Diapositiva ${i + 1} · ${slides[i].title}` });
      teach(i, pace);
      return;
    }
    setPhase("done");
    if (isLoggedIn) {
      await fetch(`/api/lessons/${lessonId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: true }),
      }).catch(() => {});
      router.refresh();
    }
  }

  // ── Pregunta libre ──
  async function ask(question: string) {
    const q = question.trim();
    if (!q || busy || offline) return;
    setInput("");
    const history = items
      .filter((i): i is { kind: "user" | "tutor"; text: string } =>
        (i.kind === "user" || i.kind === "tutor") && !("error" in i && i.error) && Boolean(i.text)
      )
      .slice(-9)
      .map((i) => ({ role: i.kind === "user" ? ("user" as const) : ("assistant" as const), content: i.text.slice(0, 4000) }));
    const firstUser = history.findIndex((m) => m.role === "user");
    const messages = [...(firstUser === -1 ? [] : history.slice(firstUser)), { role: "user" as const, content: q }];

    append({ kind: "user", text: q }, { kind: "tutor", text: "" });
    setBusy(true);
    const result = await callTutor({ slideId: slides[index].id, mode: "chat", messages }, (text) => patchLast({ text }));
    setBusy(false);
    if (typeof result !== "string") {
      patchLast({ text: result.error, error: true });
      if (result.fatal) setOffline(true);
    }
    if (phase !== "profile") setChatReturn(true);
  }

  function backToLesson() {
    setChatReturn(false);
    setViewIndex(index);
    append({ kind: "divider", text: "De vuelta a la lección" });
    // La pregunta pendiente vuelve a quedar al final del hilo
    if (phase === "quiz") {
      setItems((prev) => [...prev.filter((i) => !(i.kind === "quiz" && i.slide === index)), { kind: "quiz", slide: index }]);
    }
  }

  // ── Adaptar la slide visible ──
  async function adapt(style: Style) {
    if (busy || offline) return;
    const slide = slides[viewIndex];
    const key = `${slide.id}:${style}`;
    setAdaptNote(null);
    setActiveStyle(style);
    if (adapted[key]) return;
    setBusy(true);
    const result = await callTutor({ slideId: slide.id, mode: "adapt", style }, (text) =>
      setAdapted((prev) => ({ ...prev, [key]: text }))
    );
    setBusy(false);
    if (typeof result !== "string") {
      setAdaptNote(result.error);
      setActiveStyle(null);
      setAdapted((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
      if (result.fatal) setOffline(true);
    }
  }

  // Flechas: repasar slides ya vistas
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowLeft" && viewIndex > 0) {
        setViewIndex(viewIndex - 1);
        setActiveStyle(null);
      }
      if (e.key === "ArrowRight" && viewIndex < index) {
        setViewIndex(viewIndex + 1);
        setActiveStyle(null);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, viewIndex]);

  const viewed = slides[viewIndex];
  const adaptedText = activeStyle ? adapted[`${viewed.id}:${activeStyle}`] : undefined;
  const shown = adaptedText !== undefined ? parseAdapted(adaptedText, viewed.title) : viewed;
  const firstTry = slides.filter((s, i) => s.quiz && quizzes[i]?.solved && quizzes[i]?.chosen.length === 1).length;
  const quizCount = slides.filter((s) => s.quiz).length;
  const isLast = index === slides.length - 1;
  const lastQuizItem = [...items].reverse().find((i) => i.kind === "quiz");

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_440px]">
      {/* ── Pizarra: la diapositiva ── */}
      <div>
        <div className="relative flex min-h-[380px] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_18px_40px_-18px_rgba(30,36,48,0.25)] lg:aspect-[16/10] lg:min-h-0">
          {viewIndex !== index && (
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 bg-amber-50 px-6 py-2 text-xs font-semibold text-amber-900">
              <span>Repasando la diapositiva {viewIndex + 1}</span>
              <button onClick={() => { setViewIndex(index); setActiveStyle(null); }} className="text-brand hover:underline">
                Volver a la actual
              </button>
            </div>
          )}
          {adaptedText !== undefined && activeStyle && (
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/10 bg-ink/[0.03] px-6 py-2 text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-ink">
                <svg viewBox="0 0 16 16" className="h-3 w-3 text-brand" fill="currentColor" aria-hidden="true">
                  <path d="M8 0l1.8 5.2L15 7l-5.2 1.8L8 14l-1.8-5.2L1 7l5.2-1.8z" />
                </svg>
                Versión adaptada por IA · {STYLE_LABELS[activeStyle]}
              </span>
              <button onClick={() => setActiveStyle(null)} className="font-semibold text-brand hover:underline">
                Volver al original
              </button>
            </div>
          )}
          <div className="flex flex-1 flex-col px-6 py-7 sm:px-10 sm:py-9">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
              {lessonTitle} · {viewIndex + 1} / {slides.length}
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

        {/* Progreso de la lección */}
        <div className="mt-4 flex items-center gap-3">
          <div className="flex gap-1.5">
            {slides.map((s, i) => (
              <button
                key={s.id}
                disabled={i > index}
                onClick={() => { setViewIndex(i); setActiveStyle(null); }}
                aria-label={`Ver diapositiva ${i + 1}`}
                className={`h-2 rounded-full transition-all disabled:cursor-default ${
                  i === viewIndex ? "w-6 bg-brand" : i <= index ? "w-2 bg-ink/40 hover:bg-ink/60" : "w-2 bg-neutral-200"
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-neutral-500">
            Diapositiva {index + 1} de {slides.length}
          </span>
        </div>

        {!offline && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-sm text-neutral-500">¿No quedó claro?</span>
            {(Object.keys(STYLE_LABELS) as Style[]).map((style) => (
              <button
                key={style}
                onClick={() => adapt(style)}
                disabled={busy || phase === "profile"}
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
        )}
        {busy && activeStyle && adaptedText === undefined && (
          <p className="mt-2 animate-pulse text-sm text-neutral-500">Adaptando la diapositiva…</p>
        )}
        {adaptNote && <p className="mt-2 text-sm text-brand">{adaptNote}</p>}
      </div>

      {/* ── Tutor: conduce la lección ── */}
      <aside className="flex h-[620px] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)] lg:max-h-[760px]">
        <div className="flex items-center justify-between gap-2 border-b border-neutral-200 px-4 py-3">
          <div className="min-w-0">
            <p className="font-semibold text-ink">Tutor IA</p>
            {profile ? (
              <p className="truncate text-xs text-neutral-500">
                {profile.role} · {profile.experience}{" "}
                <button
                  onClick={() => append({ kind: "profile" })}
                  disabled={busy}
                  className="font-semibold text-brand hover:underline"
                >
                  cambiar
                </button>
              </p>
            ) : (
              <p className="text-xs text-neutral-500">Te guía diapositiva por diapositiva</p>
            )}
          </div>
          {offline && (
            <span className="shrink-0 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-600">
              Sin IA
            </span>
          )}
        </div>

        <div ref={logRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4 text-[14.5px] leading-relaxed">
          {items.map((item, i) => {
            switch (item.kind) {
              case "divider":
                return (
                  <p
                    key={i}
                    className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-400 before:h-px before:flex-1 before:bg-neutral-200 after:h-px after:flex-1 after:bg-neutral-200"
                  >
                    {item.text}
                  </p>
                );
              case "user":
                return (
                  <div key={i} className="ml-10 rounded-2xl rounded-br-md bg-ink px-4 py-2.5 text-white">
                    {item.text}
                  </div>
                );
              case "quiz": {
                const quiz = slides[item.slide].quiz!;
                return (
                  <QuizCard
                    key={i}
                    quiz={quiz}
                    order={shuffledOrder(slides[item.slide].id, quiz.options.length)}
                    state={quizzes[item.slide] ?? emptyQuizState}
                    disabled={busy || item.slide !== index || item !== lastQuizItem}
                    onAnswer={answer}
                  />
                );
              }
              case "profile":
                return <ProfileForm key={i} initial={profile} onSave={saveProfile} />;
              default:
                return (
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
                );
            }
          })}

          {/* Acción del paso actual */}
          {!busy && chatReturn && (
            <button onClick={backToLesson} className="btn-primary !py-2 text-sm">
              Volver a la lección →
            </button>
          )}
          {!busy && !chatReturn && phase === "answered" && (
            <button onClick={next} className="btn-primary !py-2 text-sm">
              {isLast ? "Terminar la lección ✓" : "Siguiente diapositiva →"}
            </button>
          )}
          {phase === "done" && (
            <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-green-900">
              <p className="font-semibold">¡Lección completada!</p>
              {quizCount > 0 && (
                <p className="mt-1 text-sm">
                  Respondiste {firstTry} de {quizCount} preguntas correctamente al primer intento.
                </p>
              )}
              {nextLessonHref ? (
                <Link href={nextLessonHref} className="btn-primary mt-3 w-full !py-2 text-sm">
                  Siguiente lección →
                </Link>
              ) : (
                <p className="mt-2 text-sm">Terminaste la última lección del curso. 🎉</p>
              )}
            </div>
          )}
        </div>

        {offline ? (
          <p className="border-t border-neutral-200 px-4 py-3 text-xs text-neutral-500">
            {isLoggedIn ? (
              "El tutor IA no está disponible ahora: la lección sigue con el contenido del curso."
            ) : (
              <>
                <Link href="/login" className="font-semibold text-brand hover:underline">
                  Inicia sesión
                </Link>{" "}
                para que el tutor IA te explique cada diapositiva y responda tus dudas.
              </>
            )}
          </p>
        ) : (
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
              maxLength={1000}
              disabled={busy || phase === "profile"}
              placeholder="Pregúntale algo al tutor…"
              className="input !py-2 text-sm"
              aria-label="Pregunta para el tutor"
            />
            <button
              type="submit"
              disabled={busy || phase === "profile" || !input.trim()}
              className="btn-primary !px-4 !py-2 text-sm"
            >
              Enviar
            </button>
          </form>
        )}
      </aside>
    </div>
  );
}

function ProfileForm({ initial, onSave }: { initial: Profile | null; onSave: (p: Profile) => void }) {
  const known = initial && ROLE_OPTIONS.includes(initial.role);
  const [role, setRole] = useState(initial ? (known ? initial.role : "Otro") : "");
  const [otherRole, setOtherRole] = useState(initial && !known ? initial.role : "");
  const [experience, setExperience] = useState(initial?.experience ?? "");
  const finalRole = role === "Otro" ? otherRole.trim() : role;
  const valid = finalRole.length >= 2 && experience;

  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1.5 text-sm transition ${
      active ? "border-ink bg-ink text-white" : "border-neutral-300 bg-white text-ink hover:border-ink/50"
    }`;

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <p className="text-sm font-semibold text-ink">¿Cuál es tu rol?</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {[...ROLE_OPTIONS, "Otro"].map((r) => (
          <button key={r} type="button" onClick={() => setRole(r)} className={chip(role === r)}>
            {r}
          </button>
        ))}
      </div>
      {role === "Otro" && (
        <input
          value={otherRole}
          onChange={(e) => setOtherRole(e.target.value)}
          maxLength={80}
          placeholder="Escribe tu rol"
          className="input mt-2 !py-2 text-sm"
          aria-label="Tu rol"
        />
      )}
      <p className="mt-4 text-sm font-semibold text-ink">¿Qué experiencia tienes gestionando proyectos?</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {EXPERIENCE_OPTIONS.map((x) => (
          <button key={x} type="button" onClick={() => setExperience(x)} className={chip(experience === x)}>
            {x}
          </button>
        ))}
      </div>
      <button
        type="button"
        disabled={!valid}
        onClick={() => onSave({ role: finalRole, experience })}
        className="btn-primary mt-4 w-full !py-2 text-sm"
      >
        Empezar la lección
      </button>
    </div>
  );
}
