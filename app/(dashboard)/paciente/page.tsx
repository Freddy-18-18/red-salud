import { Card } from "@/components/ui/card";
import {
  Calendar,
  Activity,
  FileText,
  Pill,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

/**
 * Dashboard Principal del Paciente - Vista General
 * Muestra resumen de salud, próximas citas y accesos rápidos
 */

export default function DashboardPacientePage() {
  return (
    <div className="p-4 lg:p-8 pb-20 lg:pb-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Vista General
        </h1>
        <p className="text-gray-600">
          Resumen de tu salud y actividades recientes
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">3</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Próximas Citas</h3>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <FileText className="h-8 w-8 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">12</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">
            Consultas Totales
          </h3>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Pill className="h-8 w-8 text-orange-600" />
            <span className="text-2xl font-bold text-gray-900">2</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">
            Medicamentos Activos
          </h3>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Activity className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">Normal</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Estado de Salud</h3>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Próximas Citas */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Próximas Citas</h2>
            <Link href="/dashboard/paciente/citas">
              <Button variant="ghost" size="sm">
                Ver todas
              </Button>
            </Link>
          </div>

          <div className="space-y-4">
            {/* Cita 1 */}
            <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  Consulta General
                </h3>
                <p className="text-sm text-gray-600">Dr. Juan Pérez</p>
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>Lunes, 5 Nov 2025 - 10:00 AM</span>
                </div>
              </div>
              <Button size="sm">Ver detalles</Button>
            </div>

            {/* Placeholder para más citas */}
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No hay más citas programadas</p>
              <Link href="/dashboard/paciente/citas">
                <Button variant="link" className="mt-2">
                  Agendar nueva cita
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Métricas de Salud */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Métricas de Salud
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Presión Arterial</span>
                  <span className="text-sm font-semibold text-green-600">
                    Normal
                  </span>
                </div>
                <p className="text-lg font-bold">120/80 mmHg</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Peso</span>
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
                <p className="text-lg font-bold">70 kg</p>
              </div>

              <Link href="/dashboard/paciente/metricas">
                <Button variant="outline" className="w-full mt-2">
                  Ver todas las métricas
                </Button>
              </Link>
            </div>
          </Card>

          {/* Accesos Rápidos */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Accesos Rápidos
            </h2>
            <div className="space-y-2">
              <Link href="/dashboard/paciente/telemedicina">
                <Button variant="outline" className="w-full justify-start">
                  <Activity className="h-4 w-4 mr-2" />
                  Iniciar Telemedicina
                </Button>
              </Link>
              <Link href="/dashboard/paciente/laboratorio">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Ver Resultados de Lab
                </Button>
              </Link>
              <Link href="/dashboard/paciente/mensajeria">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Enviar Mensaje
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
