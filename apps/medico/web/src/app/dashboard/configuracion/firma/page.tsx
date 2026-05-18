'use client';

import { FileSignature, Upload } from 'lucide-react';
import { ConfigSection } from '@/components/configuracion/config-section';

/**
 * /dashboard/configuracion/firma — stub.
 *
 * The full implementation (signature pad + image upload + PDF rendering with
 * embedded signature for recetas) is scheduled for a dedicated session.
 */
export default function FirmaPage() {
  return (
    <ConfigSection
      icon={FileSignature}
      title="Firma Digital"
      description="Tu firma se imprime en recetas, órdenes médicas y otros documentos."
    >
      <div className="flex flex-col items-center text-center py-10 px-4 border-2 border-dashed border-border rounded-xl">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
          <Upload className="h-5 w-5" aria-hidden="true" />
        </div>
        <p className="text-sm font-medium text-foreground">
          Próximamente — carga de firma digital
        </p>
        <p className="text-xs text-muted-foreground mt-2 max-w-md">
          Vas a poder subir tu firma escaneada o trazarla directamente con el
          mouse/trackpad. Se incluirá automáticamente en cada receta firmada.
        </p>
      </div>
    </ConfigSection>
  );
}
