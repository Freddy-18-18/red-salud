'use client';

import { Award } from 'lucide-react';
import { Card, CardContent } from "@red-salud/design-system";

export default function CertificacionesPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Award className="h-6 w-6 text-amber-500" />
          Mis Certificaciones
        </h1>
        <p className="text-sm text-slate-400">Logros profesionales y CME credits</p>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardContent>
          <div className="text-center py-16 text-slate-500">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-700">
              <Award className="w-10 h-10 text-amber-600/50" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Tus logros profesionales</h2>
            <p className="text-slate-400 max-w-md mx-auto">
              Completa cursos para obtener certificaciones CME y diplomas avalados por Red Salud Academy.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
