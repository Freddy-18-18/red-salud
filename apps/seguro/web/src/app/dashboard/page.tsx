'use client';

import { Shield, FileText, CheckCircle2, Clock, DollarSign, Users, TrendingUp, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@red-salud/design-system";

export default function SeguroOverviewPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6 text-indigo-600" />
          Panel de Seguros
        </h1>
        <p className="text-sm text-muted-foreground">Resumen de operaciones de seguros</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <FileText className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">Polizas Activas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">Reclamos Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">Aprobados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">Afiliados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-xs text-muted-foreground">Total Facturado</p>
            <p className="text-2xl font-bold">$0.00</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-xs text-muted-foreground">Total Aprobado</p>
            <p className="text-2xl font-bold text-green-600">$0.00</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-xs text-muted-foreground">Total Pagado</p>
            <p className="text-2xl font-bold text-emerald-600">$0.00</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Tasa de Aprobacion</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
              <div className="bg-green-500 h-full rounded-full" style={{ width: '0%' }} />
            </div>
            <span className="text-sm font-bold">0%</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Reclamos Recientes</CardTitle></CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No hay reclamos recientes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Autorizaciones Pendientes</CardTitle></CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No hay autorizaciones pendientes</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
