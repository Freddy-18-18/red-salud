'use client';

import {
  FlaskConical,
  FileText,
  Package,
  ArrowRightLeft,
} from 'lucide-react';
import {
  Card,
  CardContent,
} from '@red-salud/design-system';

export default function LaboratoriosPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold">Integracion con Laboratorios</h1>
          <p className="text-muted-foreground">
            Conexion directa con laboratorios para resultados y pedidos
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="py-20">
            <div className="text-center max-w-lg mx-auto">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-950/30">
                  <FlaskConical className="h-7 w-7 text-indigo-600" />
                </div>
                <div className="p-3 rounded-xl bg-teal-100 dark:bg-teal-950/30">
                  <ArrowRightLeft className="h-7 w-7 text-teal-600" />
                </div>
                <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-950/30">
                  <Package className="h-7 w-7 text-blue-600" />
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-2">Proximamente</h2>
              <p className="text-muted-foreground mb-6">
                Estamos desarrollando la integracion con laboratorios para
                optimizar tu flujo de trabajo.
              </p>

              <div className="space-y-3 text-left">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40">
                  <FileText className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">
                      Recepcion de Resultados
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Recibe resultados de laboratorio directamente en el sistema
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40">
                  <Package className="h-5 w-5 text-teal-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">
                      Seguimiento de Pedidos
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Rastrea pedidos de insumos y reactivos a laboratorios
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
