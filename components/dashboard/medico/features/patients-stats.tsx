"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, TrendingDown, Activity } from "lucide-react";

interface PatientsStatsProps {
  totalPatients: number;
  registeredPatients: number;
  offlinePatients: number;
  totalConsultations: number;
  monthlyConsultations: number;
  previousMonthConsultations?: number;
}

export function PatientsStats({
  totalPatients,
  registeredPatients,
  offlinePatients,
  totalConsultations,
  monthlyConsultations,
  previousMonthConsultations = 0,
}: PatientsStatsProps) {
  const consultationsTrend = monthlyConsultations - previousMonthConsultations;
  const trendPercentage = previousMonthConsultations > 0
    ? Math.round((consultationsTrend / previousMonthConsultations) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Patients */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Pacientes</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalPatients}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  {registeredPatients} registrados
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {offlinePatients} sin cuenta
                </Badge>
              </div>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Registered Patients */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Registrados</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{registeredPatients}</p>
              <p className="text-xs text-gray-500 mt-2">
                {totalPatients > 0
                  ? `${Math.round((registeredPatients / totalPatients) * 100)}% del total`
                  : "0% del total"}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Consultations */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Consultas</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalConsultations}</p>
              <p className="text-xs text-gray-500 mt-2">
                {registeredPatients > 0
                  ? `${(totalConsultations / registeredPatients).toFixed(1)} promedio por paciente`
                  : "Sin consultas"}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Consultations */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Este Mes</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{monthlyConsultations}</p>
              {previousMonthConsultations > 0 && (
                <div className="flex items-center gap-1 mt-2">
                  {consultationsTrend >= 0 ? (
                    <>
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-xs text-green-600 font-medium">
                        +{trendPercentage}%
                      </span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-4 w-4 text-red-600" />
                      <span className="text-xs text-red-600 font-medium">
                        {trendPercentage}%
                      </span>
                    </>
                  )}
                  <span className="text-xs text-gray-500">vs mes anterior</span>
                </div>
              )}
            </div>
            <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
              <Activity className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
