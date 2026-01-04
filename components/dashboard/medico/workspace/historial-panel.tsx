"use client";

import { Button } from "@/components/ui/button";
import { Activity, Calendar, ChevronRight, ChevronLeft } from "lucide-react";

interface HistorialItem {
  id: string;
  fecha: string;
  diagnostico: string;
  notas: string;
  doctor: string;
}

interface HistorialPanelProps {
  historialClinico: HistorialItem[];
  showHistorial: boolean;
  onToggle: () => void;
  onSelectItem: (item: HistorialItem) => void;
}

export function HistorialPanel({
  historialClinico,
  showHistorial,
  onToggle,
  onSelectItem,
}: HistorialPanelProps) {
  return (
    <div className={`border-l bg-white flex flex-col transition-all duration-300 flex-shrink-0 ${
      showHistorial ? 'w-80' : 'w-12'
    }`}>
      <div className="flex-shrink-0 px-4 py-3 border-b bg-gradient-to-r from-blue-50 to-purple-50 flex items-center justify-between">
        {showHistorial ? (
          <>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-semibold text-gray-900 truncate">Historial Clínico</h2>
              <p className="text-xs text-gray-600 truncate">Consultas anteriores</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="h-8 w-8 p-0 flex-shrink-0 ml-2"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="h-8 w-8 p-0 mx-auto"
            title="Mostrar historial"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {showHistorial && (
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4">
          {historialClinico.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Sin historial</p>
              <p className="text-xs text-gray-500 mt-1">
                Primera consulta del paciente
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {historialClinico.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectItem(item)}
                  className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
                >
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="text-xs text-gray-600 truncate">
                        {new Date(item.fecha).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 flex-shrink-0" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1 break-words">
                    {item.diagnostico}
                  </h3>
                  <p className="text-xs text-gray-600 line-clamp-2 break-words">
                    {item.notas}
                  </p>
                  <p className="text-xs text-gray-500 mt-2 truncate">
                    Dr. {item.doctor}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
