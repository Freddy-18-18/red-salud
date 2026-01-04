"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface HistorialItem {
  id: string;
  fecha: string;
  diagnostico: string;
  notas: string;
  doctor: string;
}

interface HistorialDetailDialogProps {
  historial: HistorialItem | null;
  onClose: () => void;
}

export function HistorialDetailDialog({ historial, onClose }: HistorialDetailDialogProps) {
  return (
    <Dialog open={!!historial} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Consulta Anterior</DialogTitle>
          <DialogDescription>
            {historial && new Date(historial.fecha).toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </DialogDescription>
        </DialogHeader>

        {historial && (
          <div className="space-y-4 mt-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Diagnóstico</h3>
              <p className="text-sm text-gray-700">{historial.diagnostico}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Notas Médicas</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{historial.notas}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Médico Tratante</h3>
              <p className="text-sm text-gray-700">{historial.doctor}</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
