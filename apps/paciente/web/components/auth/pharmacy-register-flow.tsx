"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Building2,
    MapPin,
    User,
    Loader2,
    CheckCircle2,
    Pill,
    Phone,
    Mail,
    ArrowLeft
} from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button, Input, Card, CardContent, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@red-salud/design-system";
import { VENEZUELA_ESTADOS } from "@/lib/data/venezuela-data";
import { formatVzlaPhone, validateVzlaPhone } from "@/app/dashboard/medico/pacientes/nuevo/_utils/phone";

export default function PharmacyRegisterFlow() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                router.push('/');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [success, router]);

    const [formData, setFormData] = useState({
        rif: '',
        businessName: '',
        state: '',
        city: '',
        legalRepName: '',
        legalRepPhone: '+58 ',
        legalRepEmail: '',
    });

    const selectedEstadoObj = VENEZUELA_ESTADOS.find(e => e.name === formData.state);
    const availableCiudades = selectedEstadoObj?.ciudades || [];

    const updateFormData = (data: Partial<typeof formData>) => {
        setFormData(prev => ({ ...prev, ...data }));
    };

    const handleSubmit = async () => {
        if (!formData.rif || !formData.businessName || !formData.legalRepEmail || !formData.legalRepPhone) {
            toast.error('Por favor complete todos los campos obligatorios');
            return;
        }

        const phoneError = validateVzlaPhone(formData.legalRepPhone);
        if (phoneError) {
            toast.error(phoneError);
            return;
        }

        setLoading(true);
        try {
            // Ya no requerimos autenticación, ahora es un "Lead" o solicitud comercial
            const { error: ticketError } = await supabase
                .from('support_tickets')
                .insert({
                    name: formData.businessName,
                    email: formData.legalRepEmail,
                    phone: formData.legalRepPhone,
                    company: formData.businessName,
                    subject: 'empresas',
                    message: `Solicitud de registro de farmacia. RIF: ${formData.rif}. Ubicación: ${formData.state}, ${formData.city}.`,
                    metadata: {
                        rif: formData.rif,
                        state: formData.state,
                        city: formData.city
                    },
                    status: 'NUEVO'
                });

            if (ticketError) throw ticketError;

            toast.success('Solicitud enviada con éxito. Nuestro equipo se pondrá en contacto pronto.');

            // Opcionalmente resetear el formulario
            setFormData({
                rif: '',
                businessName: '',
                legalRepEmail: '',
                legalRepPhone: '+58 ',
                state: '',
                city: '',
                legalRepName: '',
            });
            setSuccess(true);
        } catch (error: unknown) {
            console.error('Error al enviar formulario:', error);
            const errorMessage = error instanceof Error ? error.message : 'Error al enviar la solicitud';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="h-screen w-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 overflow-hidden">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-6"
                >
                    <div className="inline-flex p-6 bg-emerald-500 rounded-full text-white shadow-xl shadow-emerald-500/20 mb-4">
                        <CheckCircle2 className="w-16 h-16" />
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 tracking-tight">¡Solicitud Enviada!</h1>
                    <p className="text-slate-500 max-w-md mx-auto text-lg">
                        Gracias por unirte a Red Salud. Nuestro equipo revisará tus datos y se pondrá en contacto contigo en las próximas 24-48 horas.
                    </p>
                    <div className="pt-8">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto opacity-40" />
                        <p className="text-xs text-slate-400 mt-2 uppercase tracking-widest font-bold">Redirigiendo al panel...</p>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen overflow-hidden bg-[#F8FAFC] flex items-center justify-center p-4 relative">
            <button
                onClick={() => router.push('/register')}
                className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-bold text-sm bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100"
            >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver</span>
            </button>
            <div className="max-w-2xl w-full">
                <div className="text-center mb-8">
                    <div className="inline-flex p-3 bg-blue-500/10 rounded-2xl mb-4 border border-blue-500/20">
                        <Pill className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Registro de Aliado Comercial</h1>
                    <p className="text-slate-500">Complete el formulario para iniciar su proceso de afiliación</p>
                </div>

                <Card className="border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
                    <CardContent className="p-8 md:p-10">
                        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                            {/* Section 1: Empresa */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest">
                                    <Building2 className="w-4 h-4" /> Datos de la Farmacia
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-slate-600 font-medium ml-1">RIF</Label>
                                        <Input
                                            value={formData.rif}
                                            onChange={e => updateFormData({ rif: e.target.value.toUpperCase() })}
                                            placeholder="J-12345678-9"
                                            className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all shadow-sm"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-slate-600 font-medium ml-1">Razón Social</Label>
                                        <Input
                                            value={formData.businessName}
                                            onChange={e => updateFormData({ businessName: e.target.value.toUpperCase() })}
                                            placeholder="Nombre Legal"
                                            className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Ubicación & Contacto Simplificado */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest">
                                        <MapPin className="w-4 h-4" /> Ubicación
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <Label className="text-slate-600 font-medium ml-1 text-xs">Estado</Label>
                                            <Select
                                                value={formData.state}
                                                onValueChange={(value) => {
                                                    updateFormData({ state: value, city: '' });
                                                }}
                                            >
                                                <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all shadow-sm w-full overflow-hidden text-left">
                                                    <SelectValue placeholder="Seleccionar" className="truncate block" />
                                                </SelectTrigger>
                                                <SelectContent className="max-h-[300px] overflow-y-auto">
                                                    {VENEZUELA_ESTADOS.map((estado) => (
                                                        <SelectItem key={estado.code} value={estado.name}>
                                                            {estado.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-slate-600 font-medium ml-1 text-xs">Ciudad</Label>
                                            <Select
                                                value={formData.city}
                                                onValueChange={(value) => updateFormData({ city: value })}
                                                disabled={!formData.state}
                                            >
                                                <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all shadow-sm w-full overflow-hidden text-left">
                                                    <SelectValue placeholder={formData.state ? "Seleccionar" : "Primero elije estado"} className="truncate block" />
                                                </SelectTrigger>
                                                <SelectContent className="max-h-[300px] overflow-y-auto">
                                                    {availableCiudades.map((ciudad) => (
                                                        <SelectItem key={ciudad} value={ciudad}>
                                                            {ciudad}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest">
                                        <User className="w-4 h-4" /> Representante
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-slate-600 font-medium ml-1 text-xs">Nombre Completo</Label>
                                        <Input
                                            value={formData.legalRepName}
                                            onChange={e => updateFormData({ legalRepName: e.target.value })}
                                            placeholder="Nombre del responsable"
                                            className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-slate-600 font-medium ml-1 flex items-center gap-2">
                                        <Phone className="w-3 h-3" /> Teléfono
                                    </Label>
                                    <Input
                                        value={formData.legalRepPhone}
                                        onChange={e => {
                                            const formatted = formatVzlaPhone(e.target.value);
                                            updateFormData({ legalRepPhone: formatted });
                                        }}
                                        placeholder="+58 412 123 4567"
                                        className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-slate-600 font-medium ml-1 flex items-center gap-2">
                                        <Mail className="w-3 h-3" /> Email
                                    </Label>
                                    <Input
                                        type="email"
                                        value={formData.legalRepEmail}
                                        onChange={e => updateFormData({ legalRepEmail: e.target.value })}
                                        placeholder="ejemplo@farmacia.com"
                                        className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>
                            </div>

                            <Button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-lg shadow-xl shadow-blue-500/30 transition-all active:scale-[0.98] group mt-2"
                            >
                                {loading ? (
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                                ) : (
                                    <div className="flex items-center justify-center gap-3">
                                        <span>Finalizar y Enviar Solicitud</span>
                                        <CheckCircle2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                    </div>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );

}
