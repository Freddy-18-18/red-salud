"use client";

import { useState, useCallback } from "react";
import { FlipCard } from "./flip-card";
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Input } from "@red-salud/design-system";
import { Plus, X, RotateCcw } from "lucide-react";
import { cn } from "@red-salud/core/utils";

interface MedicalFlipCardProps {
    title: string;
    icon: React.ReactNode;
    items: string[] | null;
    colorClass: string; // e.g., "text-red-600"
    bgClass: string; // e.g., "bg-red-50"
    onAdd: (item: string) => void;
    onRemove: (item: string) => void;
}

export function MedicalFlipCard({
    title,
    icon,
    items = [],
    colorClass,
    bgClass,
    onAdd,
    onRemove
}: MedicalFlipCardProps) {
    const safeItems = items || [];
    const [newItem, setNewItem] = useState("");

    const handleAdd = useCallback((e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent flip
        if (newItem.trim()) {
            onAdd(newItem.trim());
            setNewItem("");
        }
    }, [newItem, onAdd, setNewItem]);

    const handleRemove = useCallback((e: React.MouseEvent, item: string) => {
        e.stopPropagation(); // Prevent flip
        onRemove(item);
    }, [onRemove]);

    const stopProp = useCallback((e: React.MouseEvent) => e.stopPropagation(), []);

    // Front Content (Summary)
    const Front = (
        <Card className={cn("h-full border-2 hover:shadow-lg transition-shadow cursor-pointer", bgClass)}>
            <CardHeader className="p-4 pb-2">
                <CardTitle className={cn("text-sm font-medium flex items-center gap-2", colorClass)}>
                    {icon} {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <div className="flex flex-col gap-1">
                    <span className="text-2xl font-bold text-foreground">
                        {safeItems.length}
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                        {safeItems.slice(0, 2).map((item, i) => (
                            <Badge key={i} variant="outline" className="bg-background/50 text-[10px] truncate max-w-[80px]">
                                {item}
                            </Badge>
                        ))}
                        {safeItems.length > 2 && (
                            <span className="text-[10px] text-muted-foreground">+{safeItems.length - 2}</span>
                        )}
                    </div>
                    {safeItems.length === 0 && <span className="text-xs text-muted-foreground">Ninguno registrado</span>}
                </div>
                <div className="absolute bottom-3 right-3 opacity-50">
                    <RotateCcw className="h-4 w-4 text-muted-foreground" />
                </div>
            </CardContent>
        </Card>
    );

    // Back Content (Edit Mode)
    const Back = (
        <Card className="h-full border-2 border-primary/20 shadow-inner bg-background overflow-hidden flex flex-col cursor-default" onClick={stopProp}>
            <CardHeader className="p-3 pb-2 shrink-0 bg-muted/30">
                <div className="flex items-center justify-between">
                    <CardTitle className={cn("text-xs font-bold uppercase tracking-wider", colorClass)}>
                        Editar {title}
                    </CardTitle>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                        // Determine how to trigger flip back from parent if needed, 
                        // but for now relying on parent FlipCard click-outside or generic toggle
                        // Actually the FlipCard toggles on click. We need a way to close it "programmatically" or just click a "Done" button that propagates
                    }}>
                        {/* Close icon visually, but the click will bubble to FlipCard to close it */}
                        <span className="text-xs text-muted-foreground">Listo</span>
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-3 flex-1 min-h-0 flex flex-col gap-2">
                <div className="flex gap-2 shrink-0">
                    <Input
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        placeholder="Nuevo..."
                        className="h-8 text-xs"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAdd(e as unknown as React.MouseEvent);
                        }}
                    />
                    <Button size="sm" onClick={handleAdd} className="h-8 w-8 p-0 shrink-0">
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto min-h-0 space-y-1 custom-scrollbar pr-1">
                    {safeItems.map((item, i) => (
                        <div key={i} className="flex items-center justify-between bg-muted/50 p-1.5 rounded-md text-sm group">
                            <span className="truncate">{item}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                                onClick={(e) => handleRemove(e, item)}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                    ))}
                    {safeItems.length === 0 && (
                        <div className="text-center py-4 text-xs text-muted-foreground">
                            Lista vacía
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );

    return (
        <FlipCard
            front={Front}
            back={Back}
            className="h-40" // Fixed height for consistency
        />
    );
}
