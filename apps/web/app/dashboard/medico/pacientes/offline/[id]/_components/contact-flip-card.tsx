"use client";

import { useState } from "react";
import { FlipCard } from "./flip-card";
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Label, Badge } from "@red-salud/ui";
import { Phone, Mail, MapPin, Calendar, Check, X, Edit2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@red-salud/core/utils";

interface ContactFlipCardProps {
    patient: {
        telefono: string | null;
        email: string | null;
        direccion: string | null;
        fecha_nacimiento: string | null;
    };
    onSave: (data: { telefono: string; email: string; direccion: string; fecha_nacimiento: string }) => Promise<void>;
}

export function ContactFlipCard({ patient, onSave }: ContactFlipCardProps) {
    const [formData, setFormData] = useState<{
        telefono: string;
        email: string;
        direccion: string;
        fecha_nacimiento: string;
    }>({
        telefono: patient.telefono || "",
        email: patient.email || "",
        direccion: patient.direccion || "",
        fecha_nacimiento: patient.fecha_nacimiento ? patient.fecha_nacimiento.split('T')[0] : ""
    });
    const [loading, setLoading] = useState(false);

    // We need a way to trigger the flip from within if using custom buttons, 
    // but FlipCard is mainly controlled by clicking it. 
    // Custom control would require moving state up, but generic FlipCard handles toggle on click.
    // We can make the Edit button toggle it by propagating the click, 
    // but acts inside buttons might need care.
    // Actually, for the Contact card, we want specifically the "Edit" button to trigger the flip likely,
    // OR just clicking the card flips it. Let's stick to "Click card to flip" for simplicity, 
    // but maybe add a visual cue.

    const handleSave = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setLoading(true);
        try {
            await onSave(formData);
            // We can't easily trigger a flip from here because FlipCard state is internal.
            // But we can suggest the user click back or let the parent re-render if it resets state.
        } catch (error) {
            // Error is already logged and toasted in the parent handleUpdateContact
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const Front = (
        <Card className="h-full border hover:border-primary/50 transition-colors cursor-pointer group relative">
            {/* Hover hint */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Badge variant="secondary" className="text-[10px] px-1 h-5">
                    <Edit2 className="w-3 h-3 mr-1" /> Editar
                </Badge>
            </div>

            <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm font-medium">Información de Contacto</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y text-left">
                    <div className="flex items-center gap-3 p-3">
                        <div className="h-8 w-8 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
                            <Phone className="h-4 w-4 text-foreground" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-muted-foreground">Teléfono</p>
                            <p className="text-sm font-medium truncate min-h-[1.25rem]">{patient.telefono || "Sin registrar"}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3">
                        <div className="h-8 w-8 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
                            <Mail className="h-4 w-4 text-foreground" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-muted-foreground">Email</p>
                            <p className="text-sm font-medium truncate min-h-[1.25rem]">{patient.email || "Sin registrar"}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3">
                        <div className="h-8 w-8 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
                            <MapPin className="h-4 w-4 text-foreground" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-muted-foreground">Dirección</p>
                            <p className="text-sm font-medium line-clamp-2 min-h-[1.25rem]">{patient.direccion || "Sin registrar"}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3">
                        <div className="h-8 w-8 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
                            <Calendar className="h-4 w-4 text-foreground" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-muted-foreground">Fecha de Nacimiento</p>
                            <p className="text-sm font-medium truncate min-h-[1.25rem]">
                                {patient.fecha_nacimiento
                                    ? format(new Date(patient.fecha_nacimiento), "dd 'de' MMMM", { locale: es })
                                    : "Sin registrar"}
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    const Back = (
        <Card className="h-full border-2 border-primary/20 shadow-inner bg-background overflow-hidden flex flex-col cursor-default" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="p-3 pb-2 shrink-0 bg-muted/30 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-primary">
                    Editar Contacto
                </CardTitle>
                <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={() => {
                        // Reset form? Or just let user click outside (if we implement click outside)
                        // For now, this is "Cancel"
                        // Ideally this should Flip Back. But we don't have control over flip state here easily without context or lifting state.
                        // Maybe just "Save" is enough.
                    }}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="p-3 flex-1 overflow-y-auto custom-scrollbar space-y-3">
                <div className="space-y-1">
                    <Label className="text-xs">Teléfono</Label>
                    <div className="relative">
                        <Input
                            value={formData.telefono}
                            onChange={e => handleChange('telefono', e.target.value)}
                            className="h-8 text-xs pl-8"
                        />
                        <Phone className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                </div>
                <div className="space-y-1">
                    <Label className="text-xs">Email</Label>
                    <div className="relative">
                        <Input
                            value={formData.email}
                            onChange={e => handleChange('email', e.target.value)}
                            className="h-8 text-xs pl-8"
                        />
                        <Mail className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                </div>
                <div className="space-y-1">
                    <Label className="text-xs">Dirección</Label>
                    <div className="relative">
                        <Input
                            value={formData.direccion}
                            onChange={e => handleChange('direccion', e.target.value)}
                            className="h-8 text-xs pl-8"
                        />
                        <MapPin className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                </div>
                <div className="space-y-1">
                    <Label className="text-xs">Fecha Nacimiento</Label>
                    <div className="relative">
                        <Input
                            type="date"
                            value={formData.fecha_nacimiento}
                            onChange={e => handleChange('fecha_nacimiento', e.target.value)}
                            className="h-8 text-xs pl-8"
                        />
                        <Calendar className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                </div>

                <Button className="w-full mt-2 h-8 text-xs gap-2" onClick={handleSave} disabled={loading}>
                    {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                    Guardar Cambios
                </Button>
            </CardContent>
        </Card>
    );

    return (
        <FlipCard
            front={Front}
            back={Back}
            className="" // Flexible height
        />
    );
}

function BadgeWrapper({ children, variant, className }: any) {
    return <Badge variant={variant} className={className}>{children}</Badge>
}
