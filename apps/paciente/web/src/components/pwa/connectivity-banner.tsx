"use client";

import { WifiOff, Wifi } from "lucide-react";
import { useState, useEffect, useRef } from "react";

import { onStatusChange, isOnline, flushQueue } from "@/lib/offline/offline-manager";

export function ConnectivityBanner() {
  const [online, setOnline] = useState(() => isOnline());
  const [showRestored, setShowRestored] = useState(false);
  const wasOfflineRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const unsub = onStatusChange((nowOnline) => {
      setOnline(nowOnline);

      if (nowOnline && wasOfflineRef.current) {
        // Just came back online
        setShowRestored(true);
        flushQueue().catch(console.error);

        // Auto-dismiss after 3 seconds
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          setShowRestored(false);
        }, 3000);
      }

      wasOfflineRef.current = !nowOnline;
    });

    return () => {
      unsub();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Offline banner
  if (!online) {
    return (
      <div className="fixed top-16 left-0 right-0 z-50 bg-amber-500 text-white px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium animate-slide-down shadow-md">
        <WifiOff className="h-4 w-4 flex-shrink-0" />
        <span>Sin conexion — Algunos datos pueden no estar actualizados</span>
      </div>
    );
  }

  // Restored banner
  if (showRestored) {
    return (
      <div className="fixed top-16 left-0 right-0 z-50 bg-emerald-500 text-white px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium animate-slide-down shadow-md">
        <Wifi className="h-4 w-4 flex-shrink-0" />
        <span>Conexion restaurada</span>
      </div>
    );
  }

  return null;
}
