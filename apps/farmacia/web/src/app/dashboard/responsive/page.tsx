'use client';

import { Smartphone } from 'lucide-react';
import {
  Card,
  CardContent,
} from '@red-salud/design-system';

export default function ResponsivePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold">Vista Responsive</h1>
          <p className="text-muted-foreground">Optimizacion para dispositivos moviles</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="py-16">
            <div className="text-center max-w-md mx-auto">
              <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-950/30 inline-block mb-4">
                <Smartphone className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold mb-2">Proximamente</h2>
              <p className="text-muted-foreground">
                Estamos optimizando la experiencia para dispositivos moviles con
                un modo de punto de venta adaptado a pantallas tactiles.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
