"use client";

import { Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useRef, useCallback, useEffect } from "react";

const LONG_PRESS_MS = 500;

/**
 * Persistent emergency button visible on all dashboard pages.
 * Activates on long-press (500ms hold) to prevent accidental taps.
 * Fixed bottom-right on desktop, above the mobile tab bar on mobile.
 */
export function EmergencyButton() {
  const router = useRouter();
  const [pressing, setPressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);
  const startTimeRef = useRef<number>(0);

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
  }, []);

  // Clean up on unmount
  useEffect(() => clearTimers, [clearTimers]);

  const startAnimation = useCallback(() => {
    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(elapsed / LONG_PRESS_MS, 1);
      setProgress(pct);
      if (pct < 1) {
        animRef.current = requestAnimationFrame(tick);
      }
    };
    tick();
  }, []);

  const onPressStart = useCallback(() => {
    setPressing(true);
    setProgress(0);
    startTimeRef.current = Date.now();
    startAnimation();

    timerRef.current = setTimeout(() => {
      // Long-press threshold met — navigate
      setPressing(false);
      setProgress(0);
      clearTimers();
      router.push("/dashboard/emergencia");
    }, LONG_PRESS_MS);
  }, [router, clearTimers, startAnimation]);

  const onPressEnd = useCallback(() => {
    setPressing(false);
    setProgress(0);
    clearTimers();
  }, [clearTimers]);

  return (
    <button
      type="button"
      aria-label="Emergencia: mantener presionado para activar"
      onMouseDown={onPressStart}
      onMouseUp={onPressEnd}
      onMouseLeave={onPressEnd}
      onTouchStart={onPressStart}
      onTouchEnd={onPressEnd}
      onTouchCancel={onPressEnd}
      className="
        group fixed z-40 select-none touch-none
        bottom-20 right-3
        lg:bottom-6 lg:right-6
        flex items-center gap-0
        h-10 lg:h-9
        pl-0 pr-0
        rounded-full
        bg-red-600/90 hover:bg-red-600
        text-white
        ring-1 ring-red-700/30
        shadow-md shadow-red-900/20
        backdrop-blur-sm
        active:scale-95
        transition-[width,padding,background-color,box-shadow] duration-200 ease-out
        w-10 lg:w-9 hover:w-auto lg:hover:w-auto
        lg:hover:pr-3.5
        overflow-hidden
      "
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      {/* Progress ring (visible during long-press) */}
      {pressing && (
        <svg
          className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="white"
            strokeWidth="6"
            strokeDasharray={`${progress * 289} 289`}
            strokeLinecap="round"
            opacity={0.9}
          />
        </svg>
      )}

      {/* Icon */}
      <span className="flex h-10 w-10 lg:h-9 lg:w-9 shrink-0 items-center justify-center">
        <Phone
          className={`relative z-10 h-4 w-4 lg:h-4 lg:w-4 transition-transform ${
            pressing ? "scale-110" : ""
          }`}
          fill="currentColor"
        />
      </span>

      {/* Label expands on hover (desktop) only — kept hidden on mobile to
          stay out of the way of the bottom tab bar. */}
      <span className="hidden lg:inline-block whitespace-nowrap text-xs font-semibold opacity-0 -translate-x-1 transition-all duration-200 ease-out group-hover:opacity-100 group-hover:translate-x-0 group-hover:pr-1">
        Emergencia
      </span>
    </button>
  );
}
