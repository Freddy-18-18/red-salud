'use client';

import { GraduationCap, BookOpen, Flame, Trophy, Star, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@red-salud/design-system";

export default function AcademiaOverviewPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-emerald-500" />
            Bienvenido a Red Salud Academy
          </h1>
          <p className="text-sm text-slate-400">Tu centro de aprendizaje continuo en salud</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-orange-400">
            <Flame className="h-5 w-5" />
            <span className="font-bold">0 dias</span>
          </div>
          <div className="flex items-center gap-1.5 text-yellow-400">
            <Star className="h-5 w-5" />
            <span className="font-bold">0 XP</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-950 rounded-lg">
                <BookOpen className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">0</p>
                <p className="text-xs text-slate-400">Cursos Activos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-950 rounded-lg">
                <Clock className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">0h</p>
                <p className="text-xs text-slate-400">Horas de Estudio</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-950 rounded-lg">
                <Trophy className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">0</p>
                <p className="text-xs text-slate-400">Certificaciones</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-950 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">#--</p>
                <p className="text-xs text-slate-400">Ranking</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-base text-white">Cursos Recomendados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'Primeros Auxilios Basicos', level: 'Principiante', color: 'emerald' },
              { title: 'Soporte Vital Avanzado', level: 'Intermedio', color: 'blue' },
              { title: 'Farmacologia Clinica', level: 'Avanzado', color: 'purple' },
            ].map((course, i) => (
              <div
                key={i}
                className="p-4 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer"
              >
                <div className={`w-10 h-10 rounded-lg bg-${course.color}-950 flex items-center justify-center mb-3`}>
                  <BookOpen className={`h-5 w-5 text-${course.color}-400`} />
                </div>
                <h3 className="font-medium text-white text-sm">{course.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{course.level}</p>
                <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '0%' }} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-base text-white">Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            <GraduationCap className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Comienza tu primera leccion para ver tu actividad aqui</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
