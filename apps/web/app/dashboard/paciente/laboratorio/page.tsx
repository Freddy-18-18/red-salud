"use client";

import { useState, useEffect } from "react";
import { useLaboratory } from "@/hooks/use-laboratory";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@red-salud/ui";
import { Badge } from "@red-salud/ui";
import { Button } from "@red-salud/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@red-salud/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@red-salud/ui";
import {
  FlaskConical,
  FileText,
  Download,
  AlertCircle,
  CheckCircle2,
  Clock,
  Filter,
  Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import type { LabOrder, LabOrderStatus } from "@/lib/supabase/types/laboratory";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";

const statusConfig = {
  pendiente: {
    label: "Pendiente",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: Clock,
  },
  muestra_tomada: {
    label: "Muestra Tomada",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: FlaskConical,
  },
  en_proceso: {
    label: "En Proceso",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: Loader2,
  },
  completada: {
    label: "Completada",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle2,
  },
  cancelada: {
    label: "Cancelada",
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: AlertCircle,
  },
  rechazada: {
    label: "Rechazada",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: AlertCircle,
  },
};

const prioridadConfig = {
  normal: { label: "Normal", color: "bg-gray-100 text-gray-800" },
  urgente: { label: "Urgente", color: "bg-orange-100 text-orange-800" },
  stat: { label: "STAT", color: "bg-red-100 text-red-800" },
};

export default function LaboratorioPage() {
  const [userId, setUserId] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<LabOrderStatus | "all">("all");
  const [activeTab, setActiveTab] = useState<"todas" | "pendientes" | "completadas">("todas");

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUser();
  }, []);

  const filters = statusFilter !== "all" ? { status: statusFilter } : undefined;
  const { orders, stats, loading, error } = useLaboratory(userId, filters);

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "pendientes") {
      return ["pendiente", "muestra_tomada", "en_proceso"].includes(order.status);
    }
    if (activeTab === "completadas") {
      return order.status === "completada";
    }
    return true;
  });

  if (!userId) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Resultados de Laboratorio</h1>
        <p className="text-muted-foreground">
          Visualiza y gestiona tus exámenes y resultados de laboratorio
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Órdenes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_ordenes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendientes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completadas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completadas}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valores Anormales</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.con_valores_anormales}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y Tabs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Mis Órdenes de Laboratorio</CardTitle>
              <CardDescription>
                Historial completo de exámenes y resultados
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as LabOrderStatus | "all")}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="muestra_tomada">Muestra Tomada</SelectItem>
                  <SelectItem value="en_proceso">En Proceso</SelectItem>
                  <SelectItem value="completada">Completada</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "todas" | "pendientes" | "completadas")}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="todas">Todas</TabsTrigger>
              <TabsTrigger value="pendientes">
                Pendientes
                {stats.pendientes > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {stats.pendientes}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="completadas">Completadas</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                  <p className="text-destructive">{error}</p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-12">
                  <FlaskConical className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No hay órdenes de laboratorio en esta categoría
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <LabOrderCard key={order.id} order={order} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function LabOrderCard({ order }: { order: LabOrder }) {
  const StatusIcon = statusConfig[order.status].icon;
  const hasResults = order.results && order.results.length > 0;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <FlaskConical className="h-5 w-5 text-muted-foreground" />
                <span className="font-mono text-sm font-medium">
                  {order.numero_orden}
                </span>
              </div>
              <Badge
                variant="outline"
                className={statusConfig[order.status].color}
              >
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusConfig[order.status].label}
              </Badge>
              {order.prioridad !== "normal" && (
                <Badge className={prioridadConfig[order.prioridad].color}>
                  {prioridadConfig[order.prioridad].label}
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Fecha de Orden</p>
                <p className="font-medium">
                  {format(new Date(order.fecha_orden), "dd 'de' MMMM, yyyy", {
                    locale: es,
                  })}
                </p>
              </div>
              {order.medico && (
                <div>
                  <p className="text-muted-foreground">Médico Solicitante</p>
                  <p className="font-medium">{order.medico.nombre_completo}</p>
                </div>
              )}
            </div>

            {order.tests && order.tests.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Exámenes Solicitados ({order.tests.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {order.tests.slice(0, 3).map((test) => (
                    <Badge key={test.id} variant="secondary">
                      {test.test_type?.nombre}
                    </Badge>
                  ))}
                  {order.tests.length > 3 && (
                    <Badge variant="secondary">
                      +{order.tests.length - 3} más
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {order.instrucciones_paciente && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-900">
                  <strong>Instrucciones:</strong> {order.instrucciones_paciente}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 ml-4">
            <Link href={`/dashboard/paciente/laboratorio/${order.id}`}>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Ver Detalles
              </Button>
            </Link>
            {hasResults && (
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Descargar PDF
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
