"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface InviteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onInvite: (data: any) => Promise<void>;
    loading: boolean;
}

export function InviteDialog({
    open,
    onOpenChange,
    onInvite,
    loading,
}: InviteDialogProps) {
    const [form, setForm] = useState({
        email: "",
        nombre_completo: "",
        password: "",
        showPassword: false,
    });

    const handleSubmit = async () => {
        await onInvite(form);
        setForm({ email: "", nombre_completo: "", password: "", showPassword: false });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Invitar Secretaria</DialogTitle>
                    <DialogDescription>
                        Crea una cuenta para tu secretaria y asigna permisos
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="nombre">Nombre Completo</Label>
                        <Input
                            id="nombre"
                            placeholder="María García"
                            value={form.nombre_completo}
                            onChange={(e) => setForm({ ...form, nombre_completo: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="secretaria@ejemplo.com"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Contraseña</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={form.showPassword ? "text" : "password"}
                                placeholder="Mínimo 6 caracteres"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3"
                                onClick={() => setForm({ ...form, showPassword: !form.showPassword })}
                            >
                                {form.showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                        </div>
                        <p className="text-xs text-gray-500">
                            La secretaria usará este email y contraseña para iniciar sesión
                        </p>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!form.email || !form.nombre_completo || !form.password || loading}
                    >
                        {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                        Invitar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
