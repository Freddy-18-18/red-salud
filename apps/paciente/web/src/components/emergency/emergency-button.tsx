"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Phone } from "lucide-react";

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
        fixed z-50
        bottom-24 right-4
        lg:bottom-8 lg:right-8
        w-16 h-16 lg:w-18 lg:h-18
        rounded-full
        bg-red-600 hover:bg-red-700
        text-white
        shadow-lg shadow-red-600/40
        flex items-center justify-center
        transition-transform
        active:scale-95
        select-none touch-none
        group
      "
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      {/* Pulse ring */}
      <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30 group-hover:opacity-40" />

      {/* Progress ring (visible during long-press) */}
      {pressing && (
        <svg
          className="absolute inset-0 w-full h-full -rotate-90"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="white"
            strokeWidth="4"
            strokeDasharray={`${progress * 289} 289`}
            strokeLinecap="round"
            opacity={0.8}
          />
        </svg>
      )}

      {/* Icon */}
      <Phone
        className={`h-7 w-7 lg:h-8 lg:w-8 relative z-10 transition-transform ${
          pressing ? "scale-110" : ""
        }`}
        fill="currentColor"
      />

      {/* Tooltip — desktop only */}
      <span className="
        hidden lg:block
        absolute right-full mr-3
        whitespace-nowrap
        bg-gray-900 text-white text-xs font-medium
        px-3 py-1.5 rounded-lg
        opacity-0 group-hover:opacity-100
        transition-opacity pointer-events-none
      ">
        Mantener para emergencia
      </span>
    </button>
  );
}
