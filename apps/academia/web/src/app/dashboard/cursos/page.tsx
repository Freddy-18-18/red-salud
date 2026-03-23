'use client';

import { BookOpen, Search } from 'lucide-react';
import { Card, CardContent } from "@red-salud/design-system";
import { Input } from "@red-salud/design-system";

export default function CursosPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-emerald-500" />
          Catalogo de Cursos
        </h1>
        <p className="text-sm text-slate-400">Explora especialidades y comienza a aprender</p>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
        <Input className="pl-9 bg-slate-900 border-slate-700 text-white" placeholder="Buscar cursos por especialidad, tema..." />
      </div>

      <div className="flex gap-2 flex-wrap">
        {['Todos', 'Primeros Auxilios', 'Farmacologia', 'Cardiologia', 'Odontologia', 'Pediatria'].map((cat) => (
          <button
            key={cat}
            className="px-3 py-1.5 rounded-full text-xs font-medium border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
          >
            {cat}
          </button>
        ))}
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardContent>
          <div className="text-center py-12 text-slate-500">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="font-medium text-slate-300">Catalogo en construccion</p>
            <p className="text-sm mt-1">Nuevos cursos seran agregados proximamente</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
