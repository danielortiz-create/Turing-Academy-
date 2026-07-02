"use client";

import { useEffect, useState } from "react";

type VideoData = { provider: "YOUTUBE" | "VIMEO" | "MP4"; embedUrl: string };

// El reproductor solicita la URL del video al servidor. El servidor solo la
// entrega si el usuario tiene acceso, así el video no se filtra en el HTML.
export function VideoPlayer({ lessonId }: { lessonId: string }) {
  const [video, setVideo] = useState<VideoData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setVideo(null);
    setError(null);
    fetch(`/api/lessons/${lessonId}/video`)
      .then(async (res) => {
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) setError(data.error ?? "No se pudo cargar el video");
        else setVideo(data);
      })
      .catch(() => !cancelled && setError("Error de conexión"));
    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  if (error) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-xl bg-ink text-center text-white">
        <p className="max-w-sm px-4">{error}</p>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="flex aspect-video animate-pulse items-center justify-center rounded-xl bg-ink text-neutral-400">
        Cargando video…
      </div>
    );
  }

  if (video.provider === "MP4") {
    return (
      <video
        controls
        controlsList="nodownload"
        className="aspect-video w-full rounded-xl bg-black"
        src={video.embedUrl}
      />
    );
  }

  return (
    <iframe
      src={video.embedUrl}
      className="aspect-video w-full rounded-xl bg-black"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      title="Video de la lección"
    />
  );
}
