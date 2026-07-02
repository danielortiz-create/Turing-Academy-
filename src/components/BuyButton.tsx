"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function BuyButton({
  courseId,
  isLoggedIn,
  priceLabel,
}: {
  courseId: string;
  isLoggedIn: boolean;
  priceLabel: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleBuy() {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo iniciar el pago");
      } else if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button onClick={handleBuy} disabled={loading} className="btn-primary w-full text-lg">
        {loading ? "Redirigiendo a Stripe…" : `Comprar curso · ${priceLabel}`}
      </button>
      {error && <p className="text-sm text-brand">{error}</p>}
      <p className="text-center text-xs text-neutral-500">Pago seguro con Stripe</p>
    </div>
  );
}
