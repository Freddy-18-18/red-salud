/**
 * @file use-file-upload-storage.ts
 * @description Hook para subir archivos a Supabase Storage
 */

import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";

interface UseFileUploadOptions {
  bucket?: string;
  folder?: string;
  onSuccess?: (url: string, fileName: string) => void;
  onError?: (error: string) => void;
}

export function useFileUploadStorage(options: UseFileUploadOptions = {}) {
  const {
    bucket = "doctor-documents",
    folder = "certifications",
    onSuccess,
    onError,
  } = options;

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  /**
   * Sube un archivo a Supabase Storage
   */
  const uploadFile = useCallback(
    async (file: File): Promise<{ url: string; fileName: string } | null> => {
      try {
        setUploading(true);
        setProgress(0);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error("Usuario no autenticado");
        }

        // Generar nombre único para el archivo
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(7);
        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}/${folder}/${timestamp}-${randomString}.${fileExt}`;

        // Simular progreso (Supabase no da progreso real en el SDK actual)
        const progressInterval = setInterval(() => {
          setProgress((prev) => Math.min(prev + 10, 90));
        }, 200);

        // Upload file
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
          });

        clearInterval(progressInterval);
        setProgress(100);

        if (error) throw error;

        // Obtener URL pública
        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(fileName);

        if (onSuccess) {
          onSuccess(publicUrl, file.name);
        }

        return { url: publicUrl, fileName: file.name };
      } catch (err) {
        console.error("Error uploading file:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Error al subir archivo";
        if (onError) {
          onError(errorMessage);
        }
        return null;
      } finally {
        setUploading(false);
        setTimeout(() => setProgress(0), 1000);
      }
    },
    [bucket, folder, onSuccess, onError]
  );

  /**
   * Elimina un archivo de Supabase Storage
   */
  const deleteFile = useCallback(
    async (fileUrl: string): Promise<boolean> => {
      try {
        // Extraer el path del archivo de la URL
        const urlParts = fileUrl.split(`/${bucket}/`);
        if (urlParts.length < 2) {
          throw new Error("URL de archivo inválida");
        }

        const filePath = urlParts[1];
        if (!filePath) {
          throw new Error("No se pudo extraer el path del archivo");
        }

        const { error } = await supabase.storage.from(bucket).remove([filePath]);

        if (error) throw error;

        return true;
      } catch (err) {
        console.error("Error deleting file:", err);
        return false;
      }
    },
    [bucket]
  );

  return {
    uploadFile,
    deleteFile,
    uploading,
    progress,
  };
}
