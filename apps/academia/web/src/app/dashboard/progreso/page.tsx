'use client';

import { TrendingUp, Clock, Flame, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@red-salud/design-system";

export default function ProgresoPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-emerald-500" />
          Mi Progreso
        </h1>
        <p className="text-sm text-slate-400">Tu avance de aprendizaje</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-4 text-center">
            <Flame className="h-8 w-8 text-orange-400 mx-auto mb-2" />
            <p className="text-3xl font-bold text-white">0</p>
            <p className="text-xs text-slate-400">Racha de Dias</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-4 text-center">
            <Star className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-3xl font-bold text-white">0</p>
            <p className="text-xs text-slate-400">XP Total</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-4 text-center">
            <Clock className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <p className="text-3xl font-bold text-white">0h</p>
            <p className="text-xs text-slate-400">Tiempo de Estudio</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-base text-white">Historial de Aprendizaje</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 bg-slate-800 rounded-lg flex items-center justify-center">
            <p className="text-slate-500 text-sm">Grafico de actividad semanal</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-base text-white">Cursos en Progreso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            <TrendingUp className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No hay cursos en progreso. Comienza uno nuevo.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
