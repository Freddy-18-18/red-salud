import { Clock } from "lucide-react";

interface HoursDisplayProps {
  hours: string | null;
  compact?: boolean;
}

export function HoursDisplay({ hours, compact = false }: HoursDisplayProps) {
  if (!hours) {
    return compact ? null : (
      <span className="text-xs text-gray-400">Horario no disponible</span>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-1 text-xs text-gray-500">
        <Clock className="h-3 w-3 flex-shrink-0" />
        <span className="truncate">{hours}</span>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        Horario de atencion
      </h4>
      <div className="flex items-start gap-2">
        <Clock className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-gray-700 whitespace-pre-line">{hours}</p>
      </div>
    </div>
  );
}
