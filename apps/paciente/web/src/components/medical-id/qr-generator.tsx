"use client";

import { Download, Share2, Copy, Check } from "lucide-react";
import { useMemo, useRef } from "react";
import { useState } from "react";

import { generateQRSvg } from "@/lib/services/medical-id-service";

interface QRGeneratorProps {
  data: string; // The encoded QR content
  size?: number;
  patientName: string;
  onDownload?: () => void;
  onShare?: () => void;
}

export function QRGenerator({
  data,
  size = 220,
  patientName,
  onDownload,
  onShare,
}: QRGeneratorProps) {
  const [copied, setCopied] = useState(false);
  const svgContainerRef = useRef<HTMLDivElement>(null);

  const svgContent = useMemo(() => {
    if (!data) return "";
    return generateQRSvg(data, size);
  }, [data, size]);

  const handleCopyLink = async () => {
    // Extract URL from encoded payload
    try {
      const decoded = JSON.parse(decodeURIComponent(atob(data)));
      if (decoded.url) {
        await navigator.clipboard.writeText(decoded.url);
      } else {
        await navigator.clipboard.writeText(data);
      }
    } catch {
      await navigator.clipboard.writeText(data);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
      return;
    }

    // Download SVG as PNG using canvas
    const svgBlob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size * 2;
      canvas.height = size * 2;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = `qr-medico-${patientName.replace(/\s+/g, "-").toLowerCase()}.png`;
        a.click();
        URL.revokeObjectURL(downloadUrl);
      }, "image/png");

      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const handleShare = async () => {
    if (onShare) {
      onShare();
      return;
    }

    // Use Web Share API if available
    if (navigator.share) {
      try {
        // Create blob from SVG for sharing
        const svgBlob = new Blob([svgContent], { type: "image/svg+xml" });
        const url = URL.createObjectURL(svgBlob);
        const img = new Image();
        img.onload = async () => {
          const canvas = document.createElement("canvas");
          canvas.width = size * 2;
          canvas.height = size * 2;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;

          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          canvas.toBlob(async (blob) => {
            if (!blob) return;
            const file = new File(
              [blob],
              `qr-medico-${patientName.replace(/\s+/g, "-").toLowerCase()}.png`,
              { type: "image/png" }
            );
            try {
              await navigator.share({
                title: `QR Medico - ${patientName}`,
                text: "Mi identificacion medica de Red-Salud",
                files: [file],
              });
            } catch {
              // User cancelled share
            }
          }, "image/png");

          URL.revokeObjectURL(url);
        };
        img.src = url;
      } catch {
        // Fallback: copy link
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center w-[220px] h-[220px] bg-gray-100 rounded-xl">
        <p className="text-sm text-gray-400">Sin datos</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* QR Code */}
      <div
        ref={svgContainerRef}
        className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleDownload}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition"
        >
          <Download className="h-4 w-4" />
          Descargar
        </button>
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
        >
          <Share2 className="h-4 w-4" />
          Compartir
        </button>
        <button
          onClick={handleCopyLink}
          className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
        >
          {copied ? (
            <Check className="h-4 w-4 text-emerald-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
