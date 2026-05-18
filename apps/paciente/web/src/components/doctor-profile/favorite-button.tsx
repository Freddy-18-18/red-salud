"use client";

import { Heart } from "lucide-react";
import { useEffect, useState } from "react";

interface FavoriteButtonProps {
  doctorId: string;
  initialIsFavorite?: boolean;
  className?: string;
}

export function FavoriteButton({
  doctorId,
  initialIsFavorite = false,
  className = "",
}: FavoriteButtonProps) {
  const [isFav, setIsFav] = useState(initialIsFavorite);
  const [busy, setBusy] = useState(false);

  // Auto-detect on mount in case the parent didn't preload state
  useEffect(() => {
    if (initialIsFavorite) return;
    let cancelled = false;
    fetch("/api/favorites")
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        const found = (j.data ?? []).some(
          (f: { doctor_profile_id: string }) =>
            f.doctor_profile_id === doctorId,
        );
        setIsFav(found);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [doctorId, initialIsFavorite]);

  const toggle = async () => {
    if (busy) return;
    setBusy(true);
    const wasFav = isFav;
    setIsFav(!wasFav);
    try {
      if (wasFav) {
        await fetch(
          `/api/favorites?doctor_profile_id=${encodeURIComponent(doctorId)}`,
          { method: "DELETE" },
        );
      } else {
        await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ doctor_profile_id: doctorId }),
        });
      }
    } catch {
      // revert on failure
      setIsFav(wasFav);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={isFav}
      aria-label={isFav ? "Quitar de favoritos" : "Guardar en favoritos"}
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-50 ${
        isFav
          ? "border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300"
          : "border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"
      } ${className}`}
    >
      <Heart className={`h-3.5 w-3.5 ${isFav ? "fill-current" : ""}`} />
      {isFav ? "Guardado" : "Guardar"}
    </button>
  );
}
