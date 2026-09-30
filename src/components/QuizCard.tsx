"use client";

export type QuizOption = { text: string; correct: boolean; why: string };
export type Quiz = { question: string; options: QuizOption[] };

export type QuizState = {
  /** Índices originales elegidos, en orden */
  chosen: number[];
  /** Acertó (en cualquier intento) */
  solved: boolean;
  /** Se mostró la respuesta tras fallar dos veces */
  revealed: boolean;
};

export const emptyQuizState: QuizState = { chosen: [], solved: false, revealed: false };

// Orden estable pero mezclado de las opciones, para que la correcta no quede
// siempre en el mismo lugar. Depende solo del id de la slide.
export function shuffledOrder(seed: string, length: number): number[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  const order = Array.from({ length }, (_, i) => i);
  for (let i = length - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0;
    const j = h % (i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

const LETTERS = ["A", "B", "C", "D", "E"];

export function QuizCard({
  quiz,
  order,
  state,
  disabled,
  onAnswer,
}: {
  quiz: Quiz;
  order: number[];
  state: QuizState;
  disabled: boolean;
  onAnswer: (originalIndex: number) => void;
}) {
  const finished = state.solved || state.revealed;

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4" role="group" aria-label="Pregunta de comprobación">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand">Comprueba lo aprendido</p>
      <p className="mt-1.5 font-semibold text-ink">{quiz.question}</p>
      <div className="mt-3 flex flex-col gap-2">
        {order.map((originalIndex, position) => {
          const option = quiz.options[originalIndex];
          const picked = state.chosen.includes(originalIndex);
          const showCorrect = option.correct && finished;
          const showWrong = picked && !option.correct;
          const tone = showCorrect
            ? "border-green-600 bg-green-50 text-green-900"
            : showWrong
              ? "border-brand/40 bg-brand/5 text-neutral-500 line-through decoration-brand/40"
              : "border-neutral-200 bg-white text-ink hover:border-ink/40 hover:bg-neutral-50";
          return (
            <button
              key={originalIndex}
              type="button"
              disabled={disabled || finished || picked}
              onClick={() => onAnswer(originalIndex)}
              className={`flex items-start gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition disabled:cursor-default ${tone}`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold ${
                  showCorrect ? "bg-green-600 text-white" : showWrong ? "bg-brand/15 text-brand" : "bg-neutral-100 text-neutral-600"
                }`}
                aria-hidden="true"
              >
                {showCorrect ? "✓" : showWrong ? "✕" : LETTERS[position]}
              </span>
              <span className="pt-0.5">{option.text}</span>
              {(showCorrect || showWrong) && (
                <span className="sr-only">{showCorrect ? "(correcta)" : "(incorrecta)"}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
