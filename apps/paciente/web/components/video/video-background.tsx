"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface VideoBackgroundProps {
  src: string;
  overlay?: boolean;
  overlayOpacity?: number;
  className?: string;
}

/**
 * Componente optimizado para video de fondo con overlay y efectos
 * @param src - Ruta del video
 * @param overlay - Mostrar capa de overlay oscuro
 * @param overlayOpacity - Opacidad del overlay (0-1)
 * @param className - Clases CSS adicionales
 */
export function VideoBackground({
  src,
  overlay = true,
  overlayOpacity = 0.6,
  className = "",
}: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => {
      setIsLoaded(true);
      // Intentar reproducir con manejo de errores
      const playPromise = video.play();
      
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn("Autoplay bloqueado, intentando sin sonido:", err);
          video.muted = true;
          video.play().catch((e) => console.error("Error al reproducir video:", e));
        });
      }
    };

    video.addEventListener("canplay", handleCanPlay);
    // También intentar cargar inmediatamente
    if (video.readyState >= 3) {
      handleCanPlay();
    }

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
    };
  }, []);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Video */}
      <motion.video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{
          opacity: isLoaded ? 1 : 0,
          scale: isLoaded ? 1 : 1.05,
        }}
        transition={{
          opacity: { duration: 1 },
          scale: { duration: 1.2 },
        }}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
      >
        <source src={src} type="video/mp4" />
        Tu navegador no soporta videos HTML5.
      </motion.video>

      {/* Overlay */}
      {overlay && (
        <motion.div
          className="absolute inset-0 bg-linear-to-br from-blue-900/90 via-blue-800/80 to-teal-900/90 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: overlayOpacity }}
          transition={{ duration: 1, delay: 0.3 }}
        />
      )}

      {/* Patrón de puntos decorativo */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-size-[40px_40px]" />
    </div>
  );
}
