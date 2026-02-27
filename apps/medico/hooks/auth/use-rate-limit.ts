import { useState, useCallback, useEffect } from "react";

// Sistema de bloqueo progresivo más razonable
const LOCKOUT_THRESHOLDS = [
  { attempts: 3, duration: 20 * 1000 },      // 3 intentos: 20 segundos
  { attempts: 5, duration: 60 * 1000 },      // 5 intentos: 1 minuto
  { attempts: 7, duration: 3 * 60 * 1000 },  // 7 intentos: 3 minutos
  { attempts: 10, duration: 10 * 60 * 1000 }, // 10 intentos: 10 minutos
];

export function useRateLimit() {
  const [error, setError] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);

  // Efecto para manejar el contador regresivo
  useEffect(() => {
    const checkLockout = () => {
      const lockoutUntil = parseInt(localStorage.getItem("lockout_until") || "0");
      if (lockoutUntil && Date.now() < lockoutUntil) {
        const timeLeft = Math.ceil((lockoutUntil - Date.now()) / 1000);
        setRemainingSeconds(timeLeft);

        let message: string;
        if (timeLeft < 60) {
          message = `Demasiados intentos fallidos. Intenta de nuevo en ${timeLeft} segundo${timeLeft > 1 ? "s" : ""}.`;
        } else {
          const minutesLeft = Math.ceil(timeLeft / 60);
          message = `Demasiados intentos fallidos. Intenta de nuevo en ${minutesLeft} minuto${minutesLeft > 1 ? "s" : ""}.`;
        }
        setError(message);
      } else {
        setRemainingSeconds(0);
        if (localStorage.getItem("lockout_until")) {
          localStorage.removeItem("login_attempts");
          localStorage.removeItem("lockout_until");
          setError(null);
        }
      }
    };

    // Verificar inmediatamente
    checkLockout();

    // Configurar intervalo si hay tiempo restante
    const interval = setInterval(checkLockout, 1000);

    return () => clearInterval(interval);
  }, []);

  const checkRateLimit = useCallback(() => {
    const lockoutUntil = parseInt(localStorage.getItem("lockout_until") || "0");

    if (lockoutUntil && Date.now() < lockoutUntil) {
      const timeLeft = Math.ceil((lockoutUntil - Date.now()) / 1000);
      setRemainingSeconds(timeLeft);

      let message: string;
      if (timeLeft < 60) {
        message = `Demasiados intentos fallidos. Intenta de nuevo en ${timeLeft} segundo${timeLeft > 1 ? "s" : ""}.`;
      } else {
        const minutesLeft = Math.ceil(timeLeft / 60);
        message = `Demasiados intentos fallidos. Intenta de nuevo en ${minutesLeft} minuto${minutesLeft > 1 ? "s" : ""}.`;
      }

      setError(message);
      return { allowed: false, message };
    }

    return { allowed: true };
  }, []);

  const recordFailedAttempt = useCallback(() => {
    const attempts = parseInt(localStorage.getItem("login_attempts") || "0") + 1;
    localStorage.setItem("login_attempts", attempts.toString());

    // Buscar el umbral de bloqueo correspondiente
    // Usamos reverse() para encontrar el umbral más alto que coincida
    const threshold = [...LOCKOUT_THRESHOLDS].reverse().find(t => attempts >= t.attempts);

    if (threshold) {
      const lockoutUntil = Date.now() + threshold.duration;
      localStorage.setItem("lockout_until", lockoutUntil.toString());

      // Actualizar estado inmediatamente
      const seconds = Math.ceil(threshold.duration / 1000);
      setRemainingSeconds(seconds);

      let message: string;
      if (seconds < 60) {
        message = `Demasiados intentos fallidos (${attempts}). Espera ${seconds} segundos antes de intentar nuevamente.`;
      } else {
        const minutes = Math.ceil(seconds / 60);
        message = `Demasiados intentos fallidos (${attempts}). Espera ${minutes} minuto${minutes > 1 ? "s" : ""} antes de intentar nuevamente.`;
      }

      setError(message);
    }
  }, []);

  const resetAttempts = useCallback(() => {
    localStorage.removeItem("login_attempts");
    localStorage.removeItem("lockout_until");
    setError(null);
    setRemainingSeconds(0);
  }, []);

  return {
    error,
    setError,
    remainingSeconds,
    checkRateLimit,
    recordFailedAttempt,
    resetAttempts,
  };
}
