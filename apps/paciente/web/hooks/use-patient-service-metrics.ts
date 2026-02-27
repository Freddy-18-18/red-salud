import { useEffect, useState } from 'react';

export interface ServiceMetrics {
  totalPatients: number;
  totalDoctors: number;
  totalSpecialties: number;
  satisfactionPercentage: number;
  isLoading: boolean;
  error: Error | null;
}

export function usePatientServiceMetrics(): ServiceMetrics {
  const [metrics, setMetrics] = useState<ServiceMetrics>({
    totalPatients: 0,
    totalDoctors: 0,
    totalSpecialties: 132, // Valor correcto de la BD
    satisfactionPercentage: 0,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setMetrics(prev => ({ ...prev, isLoading: true }));

        const response = await fetch('/api/public-metrics', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch metrics: ${response.statusText}`);
        }

        const data = await response.json();

        setMetrics({
          totalPatients: data.total_patients || 0,
          totalDoctors: data.total_doctors || 0,
          totalSpecialties: data.total_specialties || 132, // Fallback a valor correcto
          satisfactionPercentage: data.satisfaction_percentage || 0,
          isLoading: false,
          error: null,
        });
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setMetrics(prev => ({
          ...prev,
          isLoading: false,
          error,
        }));
        console.error('Error fetching service metrics:', error);
      }
    };

    fetchMetrics();
    // Refrescar cada 5 minutos
    const interval = setInterval(fetchMetrics, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return metrics;
}
