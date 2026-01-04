"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Printer, Loader2 } from "lucide-react";

interface WorkspaceHeaderProps {
  paciente: {
    cedula: string;
    nombre_completo: string;
    edad: number | null;
    genero: string;
  };
  loading: boolean;
  onBack: () => void;
  onSave: () => void;
  onPrint: () => void;
}

export function WorkspaceHeader({
  paciente,
  loading,
  onBack,
  onSave,
  onPrint,
}: WorkspaceHeaderProps) {
  return (
    <div className="flex-shrink-0 bg-white border-b">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="h-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="h-4 w-px bg-gray-300" />
            <div>
              <h1 className="text-base font-semibold text-gray-900">{paciente.nombre_completo}</h1>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span className="font-mono">V-{paciente.cedula}</span>
                {paciente.genero && (
                  <>
                    <span>•</span>
                    <Badge variant="outline" className="text-xs h-5">
                      {paciente.genero === "M" ? "Masculino" : "Femenino"}
                    </Badge>
                  </>
                )}
                {paciente.edad && (
                  <>
                    <span>•</span>
                    <span>{paciente.edad} años</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onPrint}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
            <Button size="sm" onClick={onSave} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
