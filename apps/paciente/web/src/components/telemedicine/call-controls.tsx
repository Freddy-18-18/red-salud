"use client";

import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  MessageSquare,
  Monitor,
  PhoneOff,
  Maximize,
  Minimize,
  Clock,
} from "lucide-react";
import { useState } from "react";

import { useCallTimer } from "@/hooks/use-telemedicine";

interface CallControlsProps {
  cameraEnabled: boolean;
  micEnabled: boolean;
  chatOpen: boolean;
  startedAt?: string;
  onToggleCamera: () => void;
  onToggleMic: () => void;
  onToggleChat: () => void;
  onEndCall: () => void;
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
}

export function CallControls({
  cameraEnabled,
  micEnabled,
  chatOpen,
  startedAt,
  onToggleCamera,
  onToggleMic,
  onToggleChat,
  onEndCall,
  onToggleFullscreen,
  isFullscreen = false,
}: CallControlsProps) {
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const { formatted: duration } = useCallTimer(startedAt);

  const handleEndCall = () => {
    if (showEndConfirm) {
      onEndCall();
    } else {
      setShowEndConfirm(true);
      setTimeout(() => setShowEndConfirm(false), 3000);
    }
  };

  return (
    <div className="relative">
      {/* Duration Timer */}
      {startedAt && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 bg-gray-900/70 rounded-full backdrop-blur-sm">
          <Clock className="h-3 w-3 text-gray-300" />
          <span className="text-xs font-mono text-gray-200">{duration}</span>
        </div>
      )}

      {/* Controls Bar */}
      <div className="flex items-center justify-center gap-3 p-4 bg-gray-900/80 backdrop-blur-sm rounded-2xl">
        {/* Camera Toggle */}
        <button
          onClick={onToggleCamera}
          className={`p-3 rounded-xl transition ${
            cameraEnabled
              ? "bg-gray-700 hover:bg-gray-600 text-white"
              : "bg-red-500/20 hover:bg-red-500/30 text-red-400"
          }`}
          title={cameraEnabled ? "Desactivar camara" : "Activar camara"}
        >
          {cameraEnabled ? (
            <Camera className="h-5 w-5" />
          ) : (
            <CameraOff className="h-5 w-5" />
          )}
        </button>

        {/* Mic Toggle */}
        <button
          onClick={onToggleMic}
          className={`p-3 rounded-xl transition ${
            micEnabled
              ? "bg-gray-700 hover:bg-gray-600 text-white"
              : "bg-red-500/20 hover:bg-red-500/30 text-red-400"
          }`}
          title={micEnabled ? "Silenciar microfono" : "Activar microfono"}
        >
          {micEnabled ? (
            <Mic className="h-5 w-5" />
          ) : (
            <MicOff className="h-5 w-5" />
          )}
        </button>

        {/* Chat Toggle */}
        <button
          onClick={onToggleChat}
          className={`p-3 rounded-xl transition ${
            chatOpen
              ? "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400"
              : "bg-gray-700 hover:bg-gray-600 text-white"
          }`}
          title={chatOpen ? "Cerrar chat" : "Abrir chat"}
        >
          <MessageSquare className="h-5 w-5" />
        </button>

        {/* Screen Share Placeholder */}
        <button
          className="p-3 rounded-xl bg-gray-700/50 text-gray-500 cursor-not-allowed"
          title="Compartir pantalla (proximamente)"
          disabled
        >
          <Monitor className="h-5 w-5" />
        </button>

        {/* Fullscreen Toggle */}
        {onToggleFullscreen && (
          <button
            onClick={onToggleFullscreen}
            className="p-3 rounded-xl bg-gray-700 hover:bg-gray-600 text-white transition"
            title={
              isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"
            }
          >
            {isFullscreen ? (
              <Minimize className="h-5 w-5" />
            ) : (
              <Maximize className="h-5 w-5" />
            )}
          </button>
        )}

        {/* End Call */}
        <button
          onClick={handleEndCall}
          className={`px-5 py-3 rounded-xl font-medium text-sm transition ${
            showEndConfirm
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-red-500 hover:bg-red-600 text-white"
          }`}
          title="Finalizar llamada"
        >
          <div className="flex items-center gap-2">
            <PhoneOff className="h-5 w-5" />
            {showEndConfirm && (
              <span className="hidden sm:inline">Confirmar</span>
            )}
          </div>
        </button>
      </div>
    </div>
  );
}
