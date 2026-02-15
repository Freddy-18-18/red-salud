import { useState } from 'react';
import type { CalendarAppointment } from '@/components/dashboard/medico/calendar/types';
import { supabase } from '@/lib/supabase/client';
import { format } from 'date-fns';

interface DragState {
  isDragging: boolean;
  draggedAppointment: CalendarAppointment | null;
  draggedOver: { date: Date; hour: number; minute?: number; existingAppointment?: CalendarAppointment } | null;
}

export function useDragAndDrop(
  appointments: CalendarAppointment[],
  onAppointmentUpdate: (appointments: CalendarAppointment[]) => void,
  onError: (message: string) => void,
  onSuccess: (message: string) => void
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

  const handleDragOver = (date: Date, hour: number, minute: number = 0) => {
    if (!dragState.isDragging) return;
    
    // Buscar si hay una cita existente en ese horario específico
    const targetTime = new Date(date);
    targetTime.setHours(hour, minute, 0, 0);
    
    const existingAppointment = appointments.find((apt) => {
      if (apt.id === dragState.draggedAppointment?.id) return false;
      
      const aptStart = new Date(apt.fecha_hora);
      const aptEnd = new Date(apt.fecha_hora_fin);
      
      // Verificar si hay superposición de tiempo
      const draggedDuration = dragState.draggedAppointment?.duracion_minutos || 30;
      const targetEnd = new Date(targetTime.getTime() + draggedDuration * 60000);
      
      // Hay conflicto si:
      // 1. La nueva cita empieza durante una cita existente
      // 2. La nueva cita termina durante una cita existente
      // 3. La nueva cita engloba completamente una cita existente
      return (
        (targetTime >= aptStart && targetTime < aptEnd) || // empieza durante
        (targetEnd > aptStart && targetEnd <= aptEnd) || // termina durante
        (targetTime <= aptStart && targetEnd >= aptEnd) // engloba
      );
    });
    
    setDragState(prev => ({
      ...prev,
      draggedOver: { date, hour, minute, existingAppointment },
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
      // Crear nueva fecha/hora con minutos específicos
      const newDateTime = new Date(draggedOver.date);
      newDateTime.setHours(draggedOver.hour, draggedOver.minute || 0, 0, 0);

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

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Si hay una cita existente en el slot, hacer swap
      if (draggedOver.existingAppointment) {
        const originalDateTime = new Date(draggedAppointment.fecha_hora);
        
        // Actualizar ambas citas en paralelo
        const [result1, result2] = await Promise.all([
          supabase
            .from('appointments')
            .update({ 
              fecha_hora: newDateTime.toISOString(),
              fecha_hora_fin: new Date(newDateTime.getTime() + draggedAppointment.duracion_minutos * 60000).toISOString()
            })
            .eq('id', draggedAppointment.id),
          supabase
            .from('appointments')
            .update({ 
              fecha_hora: originalDateTime.toISOString(),
              fecha_hora_fin: new Date(originalDateTime.getTime() + draggedOver.existingAppointment.duracion_minutos * 60000).toISOString()
            })
            .eq('id', draggedOver.existingAppointment.id)
        ]);

        if (result1.error) throw result1.error;
        if (result2.error) throw result2.error;

        // Actualizar el estado local con ambos cambios
        const updatedAppointments = appointments.map((apt) => {
          if (apt.id === draggedAppointment.id) {
            return {
              ...apt,
              fecha_hora: newDateTime.toISOString(),
              fecha_hora_fin: new Date(newDateTime.getTime() + apt.duracion_minutos * 60000).toISOString(),
            };
          }
          if (apt.id === draggedOver.existingAppointment!.id) {
            return {
              ...apt,
              fecha_hora: originalDateTime.toISOString(),
              fecha_hora_fin: new Date(originalDateTime.getTime() + apt.duracion_minutos * 60000).toISOString(),
            };
          }
          return apt;
        });
        
        onAppointmentUpdate(updatedAppointments);
        onSuccess(`Citas intercambiadas exitosamente`);

        // Log de actividad
        await supabase.from('user_activity_log').insert({
          user_id: user.id,
          activity_type: 'appointments_swapped',
          description: `Citas intercambiadas: ${draggedAppointment.paciente_nombre} ↔ ${draggedOver.existingAppointment.paciente_nombre}`,
          status: 'success',
        });

      } else {
        // No hay conflicto, mover normalmente
        const newEndTime = new Date(newDateTime.getTime() + draggedAppointment.duracion_minutos * 60000);
        
        const { error } = await supabase
          .from('appointments')
          .update({ 
            fecha_hora: newDateTime.toISOString(),
            fecha_hora_fin: newEndTime.toISOString()
          })
          .eq('id', draggedAppointment.id);

        if (error) throw error;

        // Actualizar el estado local
        const updatedAppointments = appointments.map((apt) => {
          if (apt.id === draggedAppointment.id) {
            return {
              ...apt,
              fecha_hora: newDateTime.toISOString(),
              fecha_hora_fin: newEndTime.toISOString(),
            };
          }
          return apt;
        });
        
        onAppointmentUpdate(updatedAppointments);
        onSuccess(`Cita movida a ${format(newDateTime, 'dd/MM/yyyy HH:mm')}`);

        // Log de actividad
        await supabase.from('user_activity_log').insert({
          user_id: user.id,
          activity_type: 'appointment_rescheduled',
          description: `Cita reprogramada para ${format(newDateTime, 'dd/MM/yyyy HH:mm')}`,
          status: 'success',
        });
      }

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
