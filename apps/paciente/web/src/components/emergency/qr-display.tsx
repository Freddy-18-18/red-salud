"use client";

import {
  Download,
  Share2,
  Copy,
  Check,
  Eye,
  QrCode,
  Link2,
} from "lucide-react";
import { useMemo, useState } from "react";

import { generateQRSvg } from "@/lib/services/medical-id-service";
import { generateQRUrl } from "@/lib/services/emergency-profile-service";

// --- Types ---

interface QRDisplayProps {
  accessToken: string;
  viewCount: number;
  isActive: boolean;
}

// --- Component ---

export function QRDisplay({ accessToken, viewCount, isActive }: QRDisplayProps) {
  const [copied, setCopied] = useState(false);

  const profileUrl = useMemo(
    () => generateQRUrl(accessToken),
    [accessToken],
  );

  const svgContent = useMemo(() => {
    if (!profileUrl) return "";
    return generateQRSvg(profileUrl, 240);
  }, [profileUrl]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = profileUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const svgBlob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = 3; // High-res for print
      canvas.width = 240 * scale;
      canvas.height = 320 * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // White background
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Red header bar
      ctx.fillStyle = "#DC2626";
      ctx.fillRect(0, 0, canvas.width, 40 * scale);

      // Header text
      ctx.fillStyle = "white";
      ctx.font = `bold ${14 * scale}px system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText("EMERGENCIA MEDICA", canvas.width / 2, 26 * scale);

      // QR code
      const qrY = 50 * scale;
      ctx.drawImage(img, 15 * scale, qrY, 210 * scale, 210 * scale);

      // Footer text
      ctx.fillStyle = "#6B7280";
      ctx.font = `${10 * scale}px system-ui, sans-serif`;
      ctx.fillText("Escanea para ver perfil medico", canvas.width / 2, 275 * scale);

      // Red Salud branding
      ctx.fillStyle = "#9CA3AF";
      ctx.font = `${8 * scale}px system-ui, sans-serif`;
      ctx.fillText("red-salud.org", canvas.width / 2, 295 * scale);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = `emergencia-qr-${accessToken.slice(0, 8)}.png`;
        a.click();
        URL.revokeObjectURL(downloadUrl);
      }, "image/png");

      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Mi Perfil Medico de Emergencia",
          text: "Escanea este enlace para ver mi perfil medico de emergencia en Red Salud",
          url: profileUrl,
        });
      } catch {
        // User cancelled
      }
    } else {
      handleCopy();
    }
  };

  if (!isActive) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <div className="w-[200px] h-[200px] bg-gray-100 rounded-2xl flex items-center justify-center">
          <QrCode className="h-16 w-16 text-gray-300" />
        </div>
        <p className="text-sm text-gray-500 text-center max-w-xs">
          Activa tu perfil de emergencia para generar el codigo QR
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5">
      {/* QR Code with emergency styling */}
      <div className="relative">
        {/* Red border ring for emergency context */}
        <div className="absolute -inset-2 bg-gradient-to-b from-red-500 to-red-600 rounded-[20px] opacity-10" />
        <div className="relative p-5 bg-white rounded-2xl shadow-sm border border-red-100">
          {/* Emergency header */}
          <div className="flex items-center justify-center gap-1.5 mb-3">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-bold text-red-600 uppercase tracking-wider">
              Emergencia medica
            </span>
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          </div>
          {/* QR SVG */}
          <div
            className="mx-auto"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
          {/* Escanear label */}
          <p className="text-center text-[10px] text-gray-400 mt-2 uppercase tracking-wider">
            Escanea para ver perfil
          </p>
        </div>
      </div>

      {/* URL display */}
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-100">
          <Link2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <span className="text-xs text-gray-600 truncate flex-1 font-mono">
            {profileUrl}
          </span>
          <button
            onClick={handleCopy}
            className="flex-shrink-0 p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
            title="Copiar enlace"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <Copy className="h-3.5 w-3.5 text-gray-500" />
            )}
          </button>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleDownload}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 transition shadow-sm"
        >
          <Download className="h-4 w-4" />
          Descargar QR
        </button>
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition"
        >
          <Share2 className="h-4 w-4" />
          Compartir
        </button>
      </div>

      {/* View count */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400">
        <Eye className="h-3.5 w-3.5" />
        <span>
          Visto {viewCount} {viewCount === 1 ? "vez" : "veces"}
        </span>
      </div>
    </div>
  );
}
