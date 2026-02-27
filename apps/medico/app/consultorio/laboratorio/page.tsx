"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@red-salud/design-system";
import { Button } from "@red-salud/design-system";
import { Badge } from "@red-salud/design-system";
import { FlaskConical, Plus, Calendar, User, Search } from "lucide-react";
import { VerificationGuard } from "@/components/dashboard/medico/features/verification-guard";
import { Input } from "@red-salud/design-system";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@red-salud/design-system";

interface LabOrder {
    id: string;
    patient_id: string;
    status: string;
    created_at: string;
    prioridad?: string;
    numero_orden?: string;
    paciente?: {
        nombre_completo: string;
    };
    tests?: Array<Record<string, unknown>>;
}

export default function DoctorLaboratorioPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<LabOrder[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const loadOrders = useCallback(async (doctorId: string) => {
        const { data, error } = await supabase
            .from("lab_orders")
            .select(`
        *,
        paciente:profiles!lab_orders_paciente_id_fkey(
          nombre_completo,
          avatar_url
        )
      `)
            .eq("medico_id", doctorId)
            .order("created_at", { ascending: false });

        if (!error && data) {
            setOrders(data);
        }
    }, []);

    const loadData = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login/medico");
                return;
            }
            await loadOrders(user.id);
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setLoading(false);
        }
    }, [router, loadOrders]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.paciente?.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.numero_orden?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

    return (
        <VerificationGuard>
            <div className="container mx-auto px-4 py-8 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Laboratorio</h1>
                        <p className="text-gray-600 mt-1">Gestiona las órdenes de laboratorio de tus pacientes</p>
                    </div>
                    <Button onClick={() => router.push("/consultorio/laboratorio/nueva")}>
                        <Plus className="h-4 w-4 mr-2" />
                        Nueva Orden
                    </Button>
                </div>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Buscar por paciente o número de orden..."
                                    className="pl-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    <SelectItem value="pendiente">Pendiente</SelectItem>
                                    <SelectItem value="en_proceso">En Proceso</SelectItem>
                                    <SelectItem value="completada">Completada</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {filteredOrders.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredOrders.map((order) => (
                            <Card key={order.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <User className="h-5 w-5 text-gray-500" />
                                            <span className="text-lg truncate">{order.paciente?.nombre_completo}</span>
                                        </div>
                                        <Badge variant={order.status === 'completada' ? 'default' : 'secondary'}>
                                            {order.status}
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center justify-between text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <FlaskConical className="h-4 w-4" />
                                            <span>Orden #{order.numero_orden}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            <span>{new Date(order.created_at).toLocaleDateString("es-ES")}</span>
                                        </div>
                                    </div>

                                    {order.prioridad && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium">Prioridad:</span>
                                            <Badge variant="outline" className={
                                                order.prioridad === 'urgente' ? 'text-orange-600 border-orange-600' :
                                                    order.prioridad === 'stat' ? 'text-red-600 border-red-600' : ''
                                            }>
                                                {order.prioridad}
                                            </Badge>
                                        </div>
                                    )}

                                    <div className="flex gap-2 pt-2">
                                        <Button variant="outline" className="flex-1" onClick={() => router.push(`/consultorio/laboratorio/${order.id}`)}>
                                            Ver Detalles
                                        </Button>
                                        {order.status !== 'completada' && (
                                            <Button className="flex-1" onClick={() => router.push(`/consultorio/laboratorio/${order.id}/resultados`)}>
                                                Subir Resultados
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="py-12">
                            <div className="text-center">
                                <FlaskConical className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    No hay órdenes registradas
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    Las órdenes de laboratorio que generes aparecerán aquí
                                </p>
                                <Button onClick={() => router.push("/consultorio/laboratorio/nueva")}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Crear Primera Orden
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </VerificationGuard>
    );
}
