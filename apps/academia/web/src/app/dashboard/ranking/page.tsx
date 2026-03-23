'use client';

import { Trophy, Medal, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@red-salud/design-system";

export default function RankingPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" />
          Ranking
        </h1>
        <p className="text-sm text-slate-400">Tabla de lideres de la comunidad</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-4 text-center">
            <Medal className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Tu Posicion</p>
            <p className="text-3xl font-bold text-white">#--</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-4 text-center">
            <Trophy className="h-8 w-8 text-amber-400 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Liga Actual</p>
            <p className="text-lg font-bold text-white">Sin Liga</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-4 text-center">
            <TrendingUp className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <p className="text-xs text-slate-400">XP Esta Semana</p>
            <p className="text-3xl font-bold text-white">0</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-base text-white">Top 10 - Tabla de Lideres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 5 }, (_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50"
              >
                <span className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-300">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <div className="h-3 bg-slate-700 rounded w-32 mb-1" />
                  <div className="h-2 bg-slate-800 rounded w-20" />
                </div>
                <span className="text-sm font-bold text-slate-500">-- XP</span>
              </div>
            ))}
          </div>
          <p className="text-center text-slate-500 text-xs mt-4">
            Completa lecciones para aparecer en el ranking
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
