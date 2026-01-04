'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getUserClinics } from '@/lib/supabase/services/clinics-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2 } from 'lucide-react';


export default function DashboardClinicaPage() {
  const router = useRouter();

  const { data: clinics, isLoading } = useQuery({
    queryKey: ['user-clinics'],
    queryFn: getUserClinics,
  });

  useEffect(() => {
    // Redirigir automáticamente a la primera clínica si existe
    if (!isLoading && clinics && clinics.length > 0) {
      const firstClinic = clinics[0];
      router.push(`/dashboard/clinica/${firstClinic.id}`);
    }
  }, [clinics, isLoading, router]);

  if (isLoading) {
    return null;
  }


  // Si hay clínicas, redirigir sin mostrar nada
  if (clinics && clinics.length > 0) {
    return null;
  }


  // No hay clínicas - mostrar mensaje para crear primera clínica
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Bienvenido al Dashboard de Clínica</CardTitle>
          <CardDescription className="text-base">
            Aún no tienes clínicas registradas. Necesitas que un administrador te asigne acceso a una clínica.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">¿Qué necesito hacer?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start">
                <span className="font-bold mr-2">1.</span>
                Contacta al administrador del sistema para que cree una clínica
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">2.</span>
                Solicita que te asignen un rol en la clínica (owner, admin, finance, operations, etc.)
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">3.</span>
                Una vez asignado, actualiza esta página para ver tu dashboard
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              ¿Eres administrador del sistema?
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
              Puedes crear clínicas directamente desde la base de datos Supabase o usando la API.
              Consulta la documentación en <code className="bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded">docs/DASHBOARD_CLINICA.md</code>
            </p>
            <Button variant="outline" size="sm" asChild>
              <a href="/docs/DASHBOARD_CLINICA.md" target="_blank">
                Ver Documentación
              </a>
            </Button>
          </div>

          <Button
            className="w-full"
            onClick={() => router.refresh()}
            variant="default"
          >
            Actualizar Página
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
