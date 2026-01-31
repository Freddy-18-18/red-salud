/**
 * Layout principal del dashboard de clínica
 */

'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ClinicScopeProvider, useClinicScope } from '@/components/dashboard/clinica/clinic-scope-provider';
import { useClinicOverview } from '@/hooks/use-clinic-overview';



function ClinicLayoutContent({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const clinicId = params?.clinicId as string;
  const {
    selectedClinicId,
    setSelectedClinicId,
    setCurrentClinic,
    setCurrentLocations,
  } = useClinicScope();

  const { currentClinic, locations, isLoading } = useClinicOverview(clinicId);

  useEffect(() => {
    if (clinicId && clinicId !== selectedClinicId) {
      setSelectedClinicId(clinicId);
    }
  }, [clinicId, selectedClinicId, setSelectedClinicId]);

  useEffect(() => {
    if (currentClinic) {
      setCurrentClinic(currentClinic);
    }
  }, [currentClinic, setCurrentClinic]);

  useEffect(() => {
    if (locations) {
      setCurrentLocations(locations);
    }
  }, [locations, setCurrentLocations]);

  if (isLoading) {
    return null;
  }


  if (!currentClinic) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Clínica no encontrada</h2>
          <p className="text-muted-foreground">
            No tienes acceso a esta clínica o no existe.
          </p>
        </div>
      </div>
    );
  }

  return <div className="flex-1 space-y-4 p-8 pt-6">{children}</div>;
}

export default function ClinicDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClinicScopeProvider>
      <ClinicLayoutContent>{children}</ClinicLayoutContent>
    </ClinicScopeProvider>
  );
}
