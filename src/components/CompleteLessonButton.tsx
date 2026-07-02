"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CompleteLessonButton({
  lessonId,
  completed,
}: {
  lessonId: string;
  completed: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    await fetch(`/api/lessons/${lessonId}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !completed }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={completed ? "btn-secondary" : "btn-primary"}
    >
      {completed ? "✓ Lección completada" : "Marcar como completada"}
    </button>
  );
}
