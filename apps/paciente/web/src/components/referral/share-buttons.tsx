"use client";

import { Copy, Check, Share2, MessageCircle } from "lucide-react";
import { useState } from "react";

interface ShareButtonsProps {
  whatsappLink: string;
  onCopyLink: () => Promise<boolean>;
  onNativeShare: () => Promise<boolean>;
}

export function ShareButtons({
  whatsappLink,
  onCopyLink,
  onNativeShare,
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const supportsNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  const handleCopy = async () => {
    const success = await onCopyLink();
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {/* WhatsApp */}
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-500 text-white text-sm font-medium rounded-xl hover:bg-green-600 transition-colors"
      >
        <MessageCircle className="h-4 w-4" />
        Compartir por WhatsApp
      </a>

      {/* Copy link */}
      <button
        onClick={handleCopy}
        className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border transition-colors ${
          copied
            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
            : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
        }`}
      >
        {copied ? (
          <>
            <Check className="h-4 w-4" />
            Enlace copiado
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" />
            Copiar enlace
          </>
        )}
      </button>

      {/* Native Share API */}
      {supportsNativeShare && (
        <button
          onClick={onNativeShare}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
        >
          <Share2 className="h-4 w-4" />
          Compartir
        </button>
      )}
    </div>
  );
}
