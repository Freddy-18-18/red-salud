"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface DiagnosticsPanelProps {
  diagnosticos: string[];
  onRemove: (index: number) => void;
}

export function DiagnosticsPanel({ diagnosticos, onRemove }: DiagnosticsPanelProps) {
  if (diagnosticos.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-900">Diagnósticos Seleccionados</h3>
      {diagnosticos.map((diagnostico, index) => (
        <div
          key={index}
          className="p-3 border rounded-lg bg-blue-50 border-blue-200 flex items-start justify-between"
        >
          <p className="text-sm font-medium text-gray-900 flex-1">{diagnostico}</p>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onRemove(index)}
            className="flex-shrink-0 ml-2 h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
