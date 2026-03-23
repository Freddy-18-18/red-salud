'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getUserClinics } from '@/lib/services/clinics-service';
import { Button } from "@red-salud/design-system";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@red-salud/design-system";
import { Building2 } from 'lucide-react';

export default function DashboardClinicaPage() {
  const router = useRouter();

  const { data: clinics, isLoading } = useQuery({
    queryKey: ['user-clinics'],
    queryFn: getUserClinics,
  });

  useEffect(() => {
    if (!isLoading && clinics && clinics.length > 0) {
      const firstClinic = clinics[0];
      if (firstClinic) {
        router.push(`/dashboard/${firstClinic.id}`);
      }
    }
  }, [clinics, isLoading, router]);

  if (isLoading) {
    return null;
  }

  if (clinics && clinics.length > 0) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Bienvenido al Dashboard de Clinica</CardTitle>
          <CardDescription className="text-base">
            Aun no tienes clinicas registradas. Necesitas que un administrador te asigne acceso a una clinica.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Que necesito hacer?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start">
                <span className="font-bold mr-2">1.</span>
                Contacta al administrador del sistema para que cree una clinica
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">2.</span>
                Solicita que te asignen un rol en la clinica (owner, admin, finance, operations, etc.)
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">3.</span>
                Una vez asignado, actualiza esta pagina para ver tu dashboard
              </li>
            </ul>
          </div>
          <Button
            className="w-full"
            onClick={() => router.refresh()}
            variant="default"
          >
            Actualizar Pagina
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
