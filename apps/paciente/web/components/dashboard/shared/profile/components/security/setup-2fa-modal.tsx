"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, Loader2, Check, AlertCircle, Copy, Download } from "lucide-react";
import Image from "next/image";

interface Setup2FAModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Setup2FAModal({ isOpen, onClose }: Setup2FAModalProps) {
  const [step, setStep] = useState<"setup" | "verify" | "success">("setup");
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSetup = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/security/2fa/setup", {
        method: "POST",
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || "Error al configurar 2FA");
        return;
      }

      setQrCode(data.qrCode);
      setSecret(data.secret);
      setBackupCodes(data.backupCodes);
      setStep("verify");
    } catch {
      setError("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/security/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: verificationCode }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || "Código inválido");
        return;
      }

      setStep("success");
      setTimeout(() => {
        onClose();
        setStep("setup");
        setVerificationCode("");
      }, 3000);
    } catch {
      setError("Error al verificar código");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadBackupCodes = () => {
    const content = `Códigos de Respaldo 2FA - Red-Salud\n\n${backupCodes.join("\n")}\n\nGuarda estos códigos en un lugar seguro.`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "red-salud-backup-codes.txt";
    a.click();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[200]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-xl shadow-2xl z-[201] p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Shield className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Autenticación de Dos Factores
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {step === "setup" && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  La autenticación de dos factores agrega una capa extra de seguridad a tu cuenta.
                  Necesitarás una aplicación de autenticación como Google Authenticator o Authy.
                </p>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleSetup}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Configurando...
                    </>
                  ) : (
                    "Configurar 2FA"
                  )}
                </button>
              </div>
            )}

            {step === "verify" && (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    Escanea este código QR con tu aplicación de autenticación:
                  </p>
                  {qrCode && (
                    <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                      <Image src={qrCode} alt="QR Code" width={200} height={200} />
                    </div>
                  )}
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">O ingresa este código manualmente:</p>
                    <div className="flex items-center justify-center gap-2">
                      <code className="text-sm font-mono text-gray-900">{secret}</code>
                      <button
                        onClick={() => copyToClipboard(secret)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <Copy className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-yellow-900 mb-2">
                    Códigos de Respaldo
                  </p>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {backupCodes.map((code, i) => (
                      <code key={i} className="text-xs font-mono bg-white px-2 py-1 rounded">
                        {code}
                      </code>
                    ))}
                  </div>
                  <button
                    onClick={downloadBackupCodes}
                    className="text-xs text-yellow-700 hover:text-yellow-800 flex items-center gap-1"
                  >
                    <Download className="h-3 w-3" />
                    Descargar códigos
                  </button>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <form onSubmit={handleVerify} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Código de Verificación
                    </label>
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                      maxLength={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-2xl tracking-widest font-mono"
                      placeholder="000000"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || verificationCode.length !== 6}
                    className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Verificando...
                      </>
                    ) : (
                      "Verificar y Activar"
                    )}
                  </button>
                </form>
              </div>
            )}

            {step === "success" && (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="p-3 bg-green-100 rounded-full mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-lg font-medium text-gray-900 mb-2">
                  ¡2FA Activado!
                </p>
                <p className="text-sm text-gray-500 text-center">
                  Tu cuenta ahora está protegida con autenticación de dos factores
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
