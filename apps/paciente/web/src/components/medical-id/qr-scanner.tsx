"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Camera,
  X,
  AlertTriangle,
  Phone,
  Heart,
  Pill,
  Activity,
  Shield,
  ScanLine,
} from "lucide-react";
import {
  medicalIdService,
  type QRPayload,
} from "@/lib/services/medical-id-service";

interface QRScannerProps {
  open: boolean;
  onClose: () => void;
}

export function QRScanner({ open, onClose }: QRScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState<QRPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setScanning(false);
  }, []);

  const startCamera = async () => {
    setError(null);
    setScannedData(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      setScanning(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
    } catch {
      setError(
        "No se pudo acceder a la camara. Verifica los permisos del navegador."
      );
    }
  };

  // Cleanup on unmount or close
  useEffect(() => {
    if (!open) {
      stopCamera();
      setScannedData(null);
      setManualInput("");
      setError(null);
    }
  }, [open, stopCamera]);

  const handleManualDecode = () => {
    if (!manualInput.trim()) return;

    // Try to decode as base64 QR payload
    const decoded = medicalIdService.decodeQRPayload(manualInput.trim());
    if (decoded) {
      setScannedData(decoded);
      stopCamera();
      return;
    }

    // Try to extract hash from URL
    const hashMatch = manualInput.match(/#(.+)$/);
    if (hashMatch) {
      const hashDecoded = medicalIdService.decodeQRPayload(hashMatch[1]);
      if (hashDecoded) {
        setScannedData(hashDecoded);
        stopCamera();
        return;
      }
    }

    setError("No se pudo decodificar el codigo QR. Verifica el contenido.");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50 animate-fade-in"
        onClick={() => {
          stopCamera();
          onClose();
        }}
      />

      <div className="relative z-10 w-full sm:max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-t-2xl sm:rounded-2xl shadow-xl animate-slide-down">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {scannedData ? "Informacion Medica" : "Escanear QR Medico"}
          </h2>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Scanned result */}
          {scannedData ? (
            <div className="space-y-4 animate-fade-in">
              {/* Name */}
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900">
                  {scannedData.n}
                </h3>
                {scannedData.bt && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 mt-2 bg-red-50 text-red-700 text-sm font-bold rounded-full">
                    Sangre: {scannedData.bt}
                  </span>
                )}
              </div>

              {/* Allergies - prominent */}
              {scannedData.a && scannedData.a.length > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <span className="text-sm font-bold text-red-700 uppercase">
                      ALERGIAS
                    </span>
                  </div>
                  <p className="text-base font-semibold text-red-800">
                    {scannedData.a.join(", ")}
                  </p>
                </div>
              )}

              {/* Medications */}
              {scannedData.m && scannedData.m.length > 0 && (
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
                  <Pill className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-blue-700 uppercase">
                      Medicamentos
                    </p>
                    <p className="text-sm text-blue-800 mt-0.5">
                      {scannedData.m.join(", ")}
                    </p>
                  </div>
                </div>
              )}

              {/* Conditions */}
              {scannedData.c && scannedData.c.length > 0 && (
                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl">
                  <Activity className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-amber-700 uppercase">
                      Condiciones
                    </p>
                    <p className="text-sm text-amber-800 mt-0.5">
                      {scannedData.c.join(", ")}
                    </p>
                  </div>
                </div>
              )}

              {/* Insurance */}
              {scannedData.ins && (
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <Shield className="h-5 w-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-gray-600 uppercase">
                      Seguro
                    </p>
                    <p className="text-sm text-gray-800 mt-0.5">
                      {scannedData.ins}
                    </p>
                  </div>
                </div>
              )}

              {/* Emergency contact */}
              {scannedData.ec && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="h-5 w-5 text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-700 uppercase">
                      Contacto de emergencia
                    </span>
                  </div>
                  <p className="text-base font-semibold text-emerald-900">
                    {scannedData.ec.n}
                    {scannedData.ec.r && ` (${scannedData.ec.r})`}
                  </p>
                  {scannedData.ec.p && (
                    <a
                      href={`tel:${scannedData.ec.p}`}
                      className="inline-flex items-center gap-1.5 mt-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition"
                    >
                      <Phone className="h-4 w-4" />
                      Llamar: {scannedData.ec.p}
                    </a>
                  )}
                </div>
              )}

              {/* Organ donor */}
              {scannedData.od && (
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 p-3 bg-emerald-50 rounded-xl">
                  <Heart className="h-4 w-4" />
                  Donante de organos
                </div>
              )}

              {/* View full profile link */}
              {scannedData.url && (
                <a
                  href={scannedData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center py-3 bg-emerald-500 text-white text-sm font-semibold rounded-lg hover:bg-emerald-600 transition"
                >
                  Ver perfil completo
                </a>
              )}

              {/* Scan another */}
              <button
                onClick={() => {
                  setScannedData(null);
                  setManualInput("");
                }}
                className="block w-full text-center py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
              >
                Escanear otro QR
              </button>
            </div>
          ) : (
            <>
              {/* Camera view */}
              {scanning ? (
                <div className="space-y-3">
                  <div className="relative rounded-xl overflow-hidden bg-black aspect-square max-h-[300px]">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    {/* Scan overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-48 h-48 border-2 border-white/50 rounded-2xl">
                        <ScanLine className="h-6 w-6 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    Apunta la camara al codigo QR medico.
                    <br />
                    Tambien puedes pegar el contenido del QR abajo.
                  </p>
                  <button
                    onClick={stopCamera}
                    className="w-full py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                  >
                    Cancelar camara
                  </button>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto">
                    <ScanLine className="h-8 w-8 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Escanea el QR medico de un paciente
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Util para paramedicos y personal de emergencia
                    </p>
                  </div>
                  <button
                    onClick={startCamera}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white text-sm font-semibold rounded-lg hover:bg-emerald-600 transition"
                  >
                    <Camera className="h-5 w-5" />
                    Abrir camara
                  </button>
                </div>
              )}

              {/* Manual input */}
              <div className="border-t border-gray-100 pt-4">
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  O pega el contenido del QR aqui:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="Pegar contenido del QR..."
                    className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
                  />
                  <button
                    onClick={handleManualDecode}
                    disabled={!manualInput.trim()}
                    className="px-4 py-2.5 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 disabled:opacity-50 transition"
                  >
                    Decodificar
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
