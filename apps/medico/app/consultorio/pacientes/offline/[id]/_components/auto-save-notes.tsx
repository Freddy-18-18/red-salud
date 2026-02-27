"use client";

import { useState, useEffect } from "react";
import { Textarea } from "@red-salud/design-system";
import { Loader2, Check } from "lucide-react";
import { cn } from "@red-salud/core/utils";

interface AutoSaveNotesProps {
    initialValue: string | null;
    onSave: (value: string) => Promise<void>;
    placeholder?: string;
    className?: string;
}

export function AutoSaveNotes({ initialValue, onSave, placeholder, className }: AutoSaveNotesProps) {
    const [value, setValue] = useState(initialValue || "");
    const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

    useEffect(() => {
        if (value === initialValue || status === "saving") return;

        const timer = setTimeout(async () => {
            setStatus("saving");
            try {
                await onSave(value);
                setStatus("saved");
                setTimeout(() => setStatus("idle"), 2000);
            } catch (err) {
                console.error("Error auto-saving:", err);
                setStatus("error");
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [value, initialValue, onSave, status]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setValue(e.target.value);
        if (status !== "saving") {
            setStatus("idle");
        }
    };

    return (
        <div className={cn("relative h-full flex flex-col", className)}>
            <div className="absolute top-2 right-2 z-10 pointers-events-none">
                {status === "saving" && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground animate-pulse bg-background/80 px-2 py-1 rounded">
                        <Loader2 className="h-3 w-3 animate-spin" /> Guardando...
                    </div>
                )}
                {status === "saved" && (
                    <div className="flex items-center gap-1 text-xs text-green-600 bg-background/80 px-2 py-1 rounded transition-opacity duration-1000">
                        <Check className="h-3 w-3" /> Guardado
                    </div>
                )}
                {status === "error" && (
                    <div className="flex items-center gap-1 text-xs text-destructive bg-background/80 px-2 py-1 rounded">
                        Error al guardar
                    </div>
                )}
            </div>
            <Textarea
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                className="flex-1 min-h-[200px] resize-none border-0 focus-visible:ring-0 p-4 leading-relaxed bg-transparent"
            />
        </div>
    );
}
