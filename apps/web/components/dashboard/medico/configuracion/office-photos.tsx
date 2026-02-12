"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { Button } from "@red-salud/ui";
import { Loader2, Upload, Image as ImageIcon, Star, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface OfficePhoto {
    id: string;
    url: string;
    caption?: string;
    is_cover: boolean;
}

interface OfficePhotosProps {
    officeId?: string; // Optional because we might be creating a new office (though photos usually need an ID first)
    // If officeId is missing, we might need to disable upload or handle temp uploads.
    // For now, let's require officeId, implying photos are added AFTER initial save.
    onChange?: () => void; // Trigger refresh or parent update
}

export function OfficePhotos({ officeId, onChange }: OfficePhotosProps) {
    const [photos, setPhotos] = useState<OfficePhoto[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const loadPhotos = useCallback(async () => {
        if (!officeId) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("office_photos")
                .select("*")
                .eq("office_id", officeId)
                .order("is_cover", { ascending: false })
                .order("display_order", { ascending: true });

            if (error) throw error;
            setPhotos(data || []);
        } catch (error) {
            console.error("Error loading photos:", error);
        } finally {
            setLoading(false);
        }
    }, [officeId]);

    useEffect(() => {
        if (officeId) {
            loadPhotos();
        }
    }, [officeId, loadPhotos]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0 || !officeId) return;

        setUploading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user");

            const uploadPromises = Array.from(files).map(async (file) => {
                const fileExt = file.name.split('.').pop();
                const fileName = `${officeId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

                // Upload to Storage
                const { error: uploadError } = await supabase.storage
                    .from("office-photos")
                    .upload(fileName, file);

                if (uploadError) throw uploadError;

                // Get Public URL
                const { data: { publicUrl } } = supabase.storage
                    .from("office-photos")
                    .getPublicUrl(fileName);

                // Insert into DB
                const { error: dbError } = await supabase
                    .from("office_photos")
                    .insert({
                        office_id: officeId,
                        url: publicUrl,
                        is_cover: photos.length === 0 // First photo is cover by default
                    });

                if (dbError) throw dbError;
            });

            await Promise.all(uploadPromises);
            await loadPhotos();
            onChange?.();

        } catch (error) {
            console.error("Error uploading photos:", error);
            // alert("Error al subir fotos. Asegúrate de que el formato sea válido.");
        } finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = "";
        }
    };

    const handleDelete = async (photoId: string) => {
        if (!confirm("¿Eliminar esta foto?")) return;

        try {
            // Delete from DB
            const { error: dbError } = await supabase
                .from("office_photos")
                .delete()
                .eq("id", photoId);

            if (dbError) throw dbError;

            // Try to delete from storage (optional cleanup)
            // Extract path from URL... logic might be complex if URL structure varies
            // For now, just removing from DB is sufficient for UI.

            await loadPhotos();
            onChange?.();
        } catch (error) {
            console.error("Error deleting photo:", error);
        }
    };

    const handleSetCover = async (photoId: string) => {
        if (!officeId) return;
        try {
            // Unset current cover
            await supabase
                .from("office_photos")
                .update({ is_cover: false })
                .eq("office_id", officeId);

            // Set new cover
            await supabase
                .from("office_photos")
                .update({ is_cover: true })
                .eq("id", photoId);

            await loadPhotos();
            onChange?.();
        } catch (error) {
            console.error("Error setting cover:", error);
        }
    };

    if (!officeId) {
        return (
            <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                <ImageIcon className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                    Guarda el consultorio primero para subir fotos.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Galería de Fotos
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Añade fotos de la fachada, sala de espera y consultorio.
                    </p>
                </div>
                <div>
                    <input
                        ref={inputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleUpload}
                        className="hidden"
                    />
                    <Button
                        size="sm"
                        onClick={() => inputRef.current?.click()}
                        disabled={uploading}
                    >
                        {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                        Subir Fotos
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
            ) : photos.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg">
                    <ImageIcon className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No hay fotos subidas aún</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {photos.map((photo) => (
                        <div key={photo.id} className="relative group aspect-video rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-100">
                            <Image
                                src={photo.url}
                                alt="Consultorio"
                                width={300}
                                height={200}
                                className="w-full h-full object-cover"
                            />

                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => handleDelete(photo.id)}
                                        className="text-white hover:text-red-400 p-1 bg-black/20 rounded-full"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>

                                {photo.is_cover ? (
                                    <div className="self-start bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <Star className="h-3 w-3 fill-current" />
                                        Principal
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleSetCover(photo.id)}
                                        className="self-start text-white/80 hover:text-white text-xs flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded-full"
                                    >
                                        <Star className="h-3 w-3" />
                                        Hacer Principal
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
