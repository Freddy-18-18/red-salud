'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HistorialVentasPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/ventas');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3" />
        <p className="text-muted-foreground text-sm">
          Redirigiendo a Ventas...
        </p>
      </div>
    </div>
  );
}
