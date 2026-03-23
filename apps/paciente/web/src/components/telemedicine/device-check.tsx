"use client";

import { useEffect, useRef, useState } from "react";
import {
  Camera,
  Mic,
  Volume2,
  Wifi,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useMediaDevices } from "@/hooks/use-telemedicine";

interface DeviceCheckProps {
  onReady?: () => void;
  compact?: boolean;
}

export function DeviceCheck({ onReady, compact = false }: DeviceCheckProps) {
  const {
    stream,
    audioLevel,
    cameraEnabled,
    micEnabled,
    permissionError,
    devices,
    requestAccess,
    toggleCamera,
    toggleMic,
  } = useMediaDevices();

  const videoRef = useRef<HTMLVideoElement>(null);
  const [networkStatus, setNetworkStatus] = useState<
    "checking" | "good" | "fair" | "poor"
  >("checking");
  const [speakerTested, setSpeakerTested] = useState(false);

  // Attach stream to video element
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Request media access on mount
  useEffect(() => {
    requestAccess();
  }, [requestAccess]);

  // Simple network quality check
  useEffect(() => {
    const checkNetwork = async () => {
      setNetworkStatus("checking");
      try {
        const start = performance.now();
        await fetch("/api/health", { method: "HEAD", cache: "no-cache" }).catch(
          () => null
        );
        const latency = performance.now() - start;

        if (latency < 200) setNetworkStatus("good");
        else if (latency < 500) setNetworkStatus("fair");
        else setNetworkStatus("poor");
      } catch {
        setNetworkStatus("fair");
      }
    };

    checkNetwork();
  }, []);

  const testSpeaker = () => {
    try {
      const audioCtx = new AudioContext();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
      setSpeakerTested(true);
    } catch {
      // Silently fail — user can still proceed
    }
  };

  const allReady =
    stream !== null &&
    cameraEnabled &&
    micEnabled &&
    networkStatus !== "poor" &&
    networkStatus !== "checking";

  if (permissionError) {
    return (
      <div className="p-6 bg-red-50 border border-red-100 rounded-xl text-center">
        <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
        <h3 className="font-semibold text-red-800 mb-1">
          Acceso a dispositivos requerido
        </h3>
        <p className="text-sm text-red-600 mb-4">{permissionError}</p>
        <button
          onClick={requestAccess}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition"
        >
          <RefreshCw className="h-4 w-4" />
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${compact ? "" : "p-6 bg-white border border-gray-100 rounded-xl"}`}>
      {!compact && (
        <h3 className="font-semibold text-gray-900">
          Verificacion de dispositivos
        </h3>
      )}

      {/* Camera Preview */}
      <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
        {stream && cameraEnabled ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover mirror"
            style={{ transform: "scaleX(-1)" }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Camera className="h-12 w-12 text-gray-600" />
          </div>
        )}
        {!cameraEnabled && stream && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
            <p className="text-sm text-gray-400">Camara desactivada</p>
          </div>
        )}
      </div>

      {/* Device Status Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Camera */}
        <button
          onClick={toggleCamera}
          className={`flex items-center gap-3 p-3 rounded-lg border transition ${
            cameraEnabled
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-gray-50 border-gray-200 text-gray-500"
          }`}
        >
          <Camera className="h-5 w-5 flex-shrink-0" />
          <div className="text-left min-w-0">
            <p className="text-sm font-medium truncate">Camara</p>
            <p className="text-xs truncate">
              {cameraEnabled ? "Activada" : "Desactivada"}
            </p>
          </div>
          {cameraEnabled && (
            <CheckCircle2 className="h-4 w-4 ml-auto flex-shrink-0" />
          )}
        </button>

        {/* Microphone */}
        <button
          onClick={toggleMic}
          className={`flex items-center gap-3 p-3 rounded-lg border transition ${
            micEnabled
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-gray-50 border-gray-200 text-gray-500"
          }`}
        >
          <Mic className="h-5 w-5 flex-shrink-0" />
          <div className="text-left min-w-0">
            <p className="text-sm font-medium truncate">Microfono</p>
            <p className="text-xs truncate">
              {micEnabled ? "Activado" : "Desactivado"}
            </p>
          </div>
          {micEnabled && (
            <CheckCircle2 className="h-4 w-4 ml-auto flex-shrink-0" />
          )}
        </button>

        {/* Speaker */}
        <button
          onClick={testSpeaker}
          className={`flex items-center gap-3 p-3 rounded-lg border transition ${
            speakerTested
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-gray-50 border-gray-200 text-gray-500"
          }`}
        >
          <Volume2 className="h-5 w-5 flex-shrink-0" />
          <div className="text-left min-w-0">
            <p className="text-sm font-medium truncate">Altavoz</p>
            <p className="text-xs truncate">
              {speakerTested ? "Verificado" : "Probar sonido"}
            </p>
          </div>
          {speakerTested && (
            <CheckCircle2 className="h-4 w-4 ml-auto flex-shrink-0" />
          )}
        </button>

        {/* Network */}
        <div
          className={`flex items-center gap-3 p-3 rounded-lg border ${
            networkStatus === "good"
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : networkStatus === "fair"
                ? "bg-amber-50 border-amber-200 text-amber-700"
                : networkStatus === "poor"
                  ? "bg-red-50 border-red-200 text-red-700"
                  : "bg-gray-50 border-gray-200 text-gray-500"
          }`}
        >
          <Wifi className="h-5 w-5 flex-shrink-0" />
          <div className="text-left min-w-0">
            <p className="text-sm font-medium truncate">Conexion</p>
            <p className="text-xs truncate">
              {networkStatus === "checking"
                ? "Verificando..."
                : networkStatus === "good"
                  ? "Buena"
                  : networkStatus === "fair"
                    ? "Aceptable"
                    : "Inestable"}
            </p>
          </div>
          {networkStatus === "good" && (
            <CheckCircle2 className="h-4 w-4 ml-auto flex-shrink-0" />
          )}
        </div>
      </div>

      {/* Mic Level Indicator */}
      {micEnabled && stream && (
        <div className="space-y-1">
          <p className="text-xs text-gray-500">Nivel del microfono</p>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-100"
              style={{ width: `${Math.min(audioLevel * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Device Info */}
      {devices.cameras.length > 0 && !compact && (
        <div className="text-xs text-gray-400 space-y-0.5">
          <p>
            {devices.cameras.length} camara
            {devices.cameras.length > 1 ? "s" : ""} detectada
            {devices.cameras.length > 1 ? "s" : ""}
          </p>
          <p>
            {devices.microphones.length} microfono
            {devices.microphones.length > 1 ? "s" : ""} detectado
            {devices.microphones.length > 1 ? "s" : ""}
          </p>
        </div>
      )}

      {/* Ready Button */}
      {onReady && (
        <button
          onClick={onReady}
          disabled={!allReady}
          className={`w-full py-3 rounded-lg font-medium text-sm transition ${
            allReady
              ? "bg-emerald-500 text-white hover:bg-emerald-600"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          {allReady ? "Todo listo" : "Verificando dispositivos..."}
        </button>
      )}
    </div>
  );
}
