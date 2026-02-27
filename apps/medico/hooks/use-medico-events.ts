import { useEffect } from 'react';
import { toast } from 'sonner';
import { medicoSdk } from '@/lib/sdk';
import type { MedicoEvent, MedicoEventType } from '@red-salud/sdk-medico';

interface UseMedicoEventsOptions {
    enableToasts?: boolean;
    onEvent?: (event: MedicoEvent) => void;
    filterTypes?: MedicoEventType[];
}

/**
 * Hook to listen for Medico SDK events in real-time.
 * Uses the MedicoEventBus (Supabase Realtime) under the hood.
 */
export function useMedicoEvents(options: UseMedicoEventsOptions = {}) {
    const { enableToasts = true, onEvent, filterTypes } = options;

    useEffect(() => {
        const eventBus = medicoSdk.events;

        // Standard handler for all events
        const handleEvent = (event: MedicoEvent) => {
            // Apply filters if provided
            if (filterTypes && !filterTypes.includes(event.type)) {
                return;
            }

            // Show toast if enabled
            if (enableToasts) {
                showToastForEvent(event);
            }

            // Call custom callback
            if (onEvent) {
                onEvent(event);
            }
        };

        // Helper map to show friendly messages
        const eventSubscribers = filterTypes || [
            'APPOINTMENT_CREATED',
            'PATIENT_ARRIVED',
            'PRESCRIPTION_SIGNED',
            'CONSULTATION_COMPLETED',
        ] as MedicoEventType[];

        // Subscribe to each event type
        const unsubscribers = eventSubscribers.map(type =>
            eventBus.subscribe(type, handleEvent)
        );

        return () => {
            unsubscribers.forEach(unsubscribe => unsubscribe());
        };
    }, [enableToasts, onEvent, filterTypes]);
}

/**
 * Utility to map events to toast notifications
 */
function showToastForEvent(event: MedicoEvent) {
    const { type, payload } = event;

    switch (type) {
        case 'APPOINTMENT_CREATED':
            toast.success('Nueva Cita', {
                description: `Se ha agendado una nueva cita para el paciente ${payload.patientName || 'N/A'}.`,
            });
            break;
        case 'PATIENT_ARRIVED':
            toast.info('Paciente en Sala', {
                description: `El paciente ${payload.patientName || ''} ha llegado a la clínica.`,
            });
            break;
        case 'PRESCRIPTION_SIGNED':
            toast.success('Receta Firmada', {
                description: 'La receta médica ha sido generada y firmada exitosamente.',
            });
            break;
        case 'CONSULTATION_COMPLETED':
            toast.success('Consulta Finalizada', {
                description: 'Se ha guardado el resumen de la consulta.',
            });
            break;
        default:
            console.log('Medico Event received:', event);
    }
}
