import { useState } from 'react';
import type { CalendarAppointment } from '@/components/dashboard/medico/calendar/types';
import { supabase } from '@/lib/supabase/client';
import { format } from 'date-fns';

interface DragState {
  isDragging: boolean;
  draggedAppointment: CalendarAppointment | null;
  draggedOver: { date: Date; hour: number } | null;
}

export function useDragAndDrop(
  onAppointmentUpdate: (appointment: CalendarAppointment) => void,
  onError: (message: string) => void
) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedAppointment: null,
    draggedOver: null,
  });

  const handleDragStart = (appointment: CalendarAppointment) => {
    setDragState({
      isDragging: true,
      draggedAppointment: appointment,
      draggedOver: null,
    });
  };

  const handleDragOver = (date: Date, hour: number) => {
    if (!dragState.isDragging) return;
    
    setDragState(prev => ({
      ...prev,
      draggedOver: { date, hour },
    }));
  };

  const handleDragEnd = async () => {
    const { draggedAppointment, draggedOver } = dragState;
    
    if (!draggedAppointment || !draggedOver) {
      setDragState({
        isDragging: false,
        draggedAppointment: null,
        draggedOver: null,
      });
      return;
    }

    try {
      // Crear nueva fecha/hora
      const newDateTime = new Date(draggedOver.date);
      newDateTime.setHours(draggedOver.hour, 0, 0, 0);

      // Verificar que no sea en el pasado
      if (newDateTime < new Date()) {
        onError('No puedes mover una cita a un horario pasado');
        setDragState({
          isDragging: false,
          draggedAppointment: null,
          draggedOver: null,
        });
        return;
      }

      // Verificar conflictos
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const endDateTime = new Date(newDateTime.getTime() + draggedAppointment.duracion_minutos * 60000);

      const { data: conflicts } = await supabase
        .from('appointments')
        .select('id')
        .eq('medico_id', user.id)
        .neq('id', draggedAppointment.id)
        .neq('status', 'cancelada')
        .gte('fecha_hora', newDateTime.toISOString())
        .lt('fecha_hora', endDateTime.toISOString());

      if (conflicts && conflicts.length > 0) {
        onError('Ya existe una cita en este horario');
        setDragState({
          isDragging: false,
          draggedAppointment: null,
          draggedOver: null,
        });
        return;
      }

      // Actualizar la cita
      const { error } = await supabase
        .from('appointments')
        .update({ fecha_hora: newDateTime.toISOString() })
        .eq('id', draggedAppointment.id);

      if (error) throw error;

      // Actualizar el estado local
      const updatedAppointment = {
        ...draggedAppointment,
        fecha_hora: newDateTime.toISOString(),
      };
      
      onAppointmentUpdate(updatedAppointment);

      // Log de actividad
      await supabase.from('user_activity_log').insert({
        user_id: user.id,
        activity_type: 'appointment_rescheduled',
        description: `Cita reprogramada para ${format(newDateTime, 'dd/MM/yyyy HH:mm')}`,
        status: 'success',
      });

    } catch (error) {
      console.error('Error moving appointment:', error);
      onError('Error al mover la cita');
    } finally {
      setDragState({
        isDragging: false,
        draggedAppointment: null,
        draggedOver: null,
      });
    }
  };

  const handleDragCancel = () => {
    setDragState({
      isDragging: false,
      draggedAppointment: null,
      draggedOver: null,
    });
  };

  return {
    dragState,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  };
}
