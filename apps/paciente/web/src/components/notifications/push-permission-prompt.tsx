"use client";

import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { savePushSubscription } from "@/lib/services/notification-service";

interface PushPermissionPromptProps {
  patientId: string;
}

const DISMISS_KEY = "push_prompt_dismissed_at";
const DISMISS_DAYS = 7;

export function PushPermissionPrompt({ patientId }: PushPermissionPromptProps) {
  const [visible, setVisible] = useState(false);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    // Don't show if:
    // 1. Not in a secure context (no SW support)
    // 2. Already granted
    // 3. Dismissed recently
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (!("serviceWorker" in navigator)) return;
    if (Notification.permission === "granted") return;
    if (Notification.permission === "denied") return;

    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const daysSince =
        (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
      if (daysSince < DISMISS_DAYS) return;
    }

    // Show after a short delay so it doesn't feel aggressive
    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleEnable = async () => {
    setRequesting(true);

    try {
      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          // In production, replace with your VAPID public key
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || undefined,
        });

        await savePushSubscription(patientId, subscription);
      }
    } catch (err) {
      console.error("Error requesting push permission:", err);
    }

    setVisible(false);
    setRequesting(false);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 lg:bottom-6 lg:left-auto lg:right-6 lg:max-w-sm animate-slide-down">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
            <Bell className="h-5 w-5 text-emerald-600" />
          </div>

          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">
              Activa las notificaciones
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Recibe recordatorios de medicamentos, citas y resultados de
              laboratorio al instante.
            </p>

            <div className="flex gap-2 mt-3">
              <button
                onClick={handleEnable}
                disabled={requesting}
                className="flex-1 px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {requesting ? "Activando..." : "Activar"}
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-1.5 text-gray-500 text-xs font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                Ahora no
              </button>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 text-gray-300 hover:text-gray-500 transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
