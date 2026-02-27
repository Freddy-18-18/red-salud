"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, CardDescription } from "@red-salud/design-system";
import { Loader2, Save, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import {
    updateDoctorRecipeSettings,
    uploadRecipeAsset,
} from "@/lib/supabase/services/recipe-settings";
import { SignatureCanvas, SignatureCanvasRef } from "@/components/dashboard/medico/recetas/signature-canvas";

export default function MobileSignaturePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const targetUid = searchParams?.get('uid');

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [currentUser, setCurrentUser] = useState<Record<string, unknown> | null>(null);
    const sigCanvasRef = useRef<SignatureCanvasRef>(null);

    useEffect(() => {
        async function checkAuth() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                // If not logged in, redirect to login (could add returnUrl logic here)
                // For now, simple redirect
                toast.error("Debes iniciar sesión para firmar.");
                router.push("/login/medico");
                return;
            }
            setCurrentUser(user as unknown as Record<string, unknown>);
            setIsLoading(false);

            if (targetUid && user.id !== targetUid) {
                toast.warning("Estás firmando para una cuenta diferente a la solicitada. Se usará tu cuenta actual.");
            }
        }
        checkAuth();
    }, [router, targetUid]);

    const handleSaveSignature = async () => {
        if (!currentUser || !sigCanvasRef.current) return;

        if (sigCanvasRef.current.isEmpty()) {
            toast.error("Por favor dibuje una firma antes de guardar");
            return;
        }

        setIsSaving(true);
        try {
            const dataUrl = sigCanvasRef.current.toDataURL();
            const res = await fetch(dataUrl);
            const blob = await res.blob();
            const file = new File([blob], "signature-mobile.png", { type: "image/png" });

            const { success, url, error } = await uploadRecipeAsset(currentUser.id as string, file, "signature");

            if (success && url) {
                // Update settings - null officeId means global/default which is usually what we want for mobile quick sign
                // Or we could try to infer office, but safe default is global
                await updateDoctorRecipeSettings(currentUser.id as string, { digital_signature_url: url }, null);

                toast.success("Firma guardada exitosamente");
                // Optional: redirect back or show success state
                setTimeout(() => {
                    router.push("/consultorio/recetas/configuracion");
                }, 1500);
            } else {
                throw error;
            }
        } catch (error) {
            console.error("Error saving signature:", error);
            toast.error("Error al guardar la firma");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 flex flex-col items-center justify-center">
            <div className="w-full max-w-md bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6 bg-primary/5 border-b">
                    <h1 className="text-xl font-bold text-center text-primary">Firma Digital</h1>
                    <CardDescription className="text-center mt-1">
                        Dibuja tu firma en el recuadro abajo
                    </CardDescription>
                </div>

                <div className="p-6 space-y-6">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg bg-white overflow-hidden relative shadow-inner" style={{ height: '300px' }}>
                        <SignatureCanvas
                            ref={sigCanvasRef}
                            className="w-full h-full"
                        />
                        <div className="absolute top-2 right-2 opacity-50 pointer-events-none text-xs text-muted-foreground">
                            Área de firma
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                variant="outline"
                                onClick={() => sigCanvasRef.current?.clear()}
                                disabled={isSaving}
                            >
                                <Undo2 className="h-4 w-4 mr-2" />
                                Limpiar
                            </Button>
                            <Button
                                onClick={handleSaveSignature}
                                disabled={isSaving}
                            >
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                Guardar
                            </Button>
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push("/consultorio/recetas/configuracion")}
                            className="text-muted-foreground"
                        >
                            Volver a configuración
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
