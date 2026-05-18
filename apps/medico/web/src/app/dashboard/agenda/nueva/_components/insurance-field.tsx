'use client';

import { Clock4, Shield, Sparkles } from 'lucide-react';

export interface InsuranceEntry {
  provider_id: string;
  policy_number: string;
  holder_name?: string;
  authorized_amount?: number | null;
}

interface InsuranceFieldProps {
  value: InsuranceEntry[];
  onChange: (next: InsuranceEntry[]) => void;
  max?: number;
}

/**
 * Placeholder "Próximamente" para la sección de seguros.
 *
 * El schema (insurance_providers + appointment_insurance) y los hooks ya
 * están en el repo — la UI completa se activa cuando los convenios con
 * aseguradoras estén operativos. Por ahora el doctor verá esta tarjeta.
 *
 * Mantenemos la firma del componente (value/onChange) para que el padre no
 * tenga que cambiar nada cuando se active.
 */
export function InsuranceField(_props: InsuranceFieldProps) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/20 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Shield className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">
              Seguros y pólizas
            </h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
              <Sparkles className="h-3 w-3" />
              Próximamente
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Estamos cerrando convenios con las principales aseguradoras de
            Venezuela. Pronto vas a poder asociar pólizas a la cita, ver el
            monto autorizado y dar seguimiento al reembolso desde acá mismo.
          </p>
          <ul className="grid gap-1 text-[11px] text-muted-foreground sm:grid-cols-2">
            <li className="flex items-center gap-1">
              <Clock4 className="h-3 w-3 text-primary" />
              Mercantil, Caracas, Mapfre, Banesco
            </li>
            <li className="flex items-center gap-1">
              <Clock4 className="h-3 w-3 text-primary" />
              Tracking del estado de cada póliza
            </li>
            <li className="flex items-center gap-1">
              <Clock4 className="h-3 w-3 text-primary" />
              Reportes de cobro por aseguradora
            </li>
            <li className="flex items-center gap-1">
              <Clock4 className="h-3 w-3 text-primary" />
              Generación de carta aval
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
