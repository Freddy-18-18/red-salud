'use client';

import { Palette } from 'lucide-react';
import { ThemeToggle } from '@red-salud/design-system';
import { ConfigSection } from '@/components/configuracion/config-section';

/**
 * /dashboard/configuracion/apariencia
 *
 * Theme selector. Wraps the design-system <ThemeToggle> in its "segmented"
 * variant for clarity (three explicit options).
 */
export default function AparienciaPage() {
  return (
    <ConfigSection
      icon={Palette}
      title="Tema visual"
      description="Elegí cómo se ve la app. Podés sincronizarla con tu sistema operativo."
    >
      <div className="flex items-start gap-4">
        <ThemeToggle variant="segmented" />
        <p className="text-xs text-muted-foreground max-w-md">
          El modo automático respeta tu preferencia del sistema y cambia
          dinámicamente cuando el sistema lo hace (por ejemplo, modo nocturno
          en macOS / Windows).
        </p>
      </div>
    </ConfigSection>
  );
}
