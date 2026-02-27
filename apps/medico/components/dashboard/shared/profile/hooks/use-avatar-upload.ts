import { useState, useRef } from "react";

export function useAvatarUpload(onUpload?: (file: File) => Promise<void>) {
  const [avatarHover, setAvatarHover] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona una imagen válida");
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen no debe superar los 5MB");
      return;
    }

    if (onUpload) {
      setIsUploading(true);
      try {
        await onUpload(file);
      } catch (error) {
        console.error("Error uploading avatar:", error);
        alert("Error al subir la imagen");
      } finally {
        setIsUploading(false);
      }
    }
  };

  return {
    avatarHover,
    setAvatarHover,
    isUploading,
    fileInputRef,
    handleAvatarClick,
    handleFileChange,
  };
}
