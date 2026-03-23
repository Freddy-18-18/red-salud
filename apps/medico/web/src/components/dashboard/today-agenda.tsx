'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
  Clock,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Hourglass,
  Video,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface Appointment {
  id: string;
  fecha_hora: string;
  duracion_minutos: number;
  motivo: string | null;
  status: string;
  tipo: string | null;
  paciente: {
    nombre_completo: string;
    avatar_url: string | null;
  } | null;
}

interface TodayAgendaProps {
  doctorId: string;
  themeColor?: string;
}

// ============================================================================
// STATUS HELPERS
// ============================================================================

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  scheduled: { label: 'Programada', color: 'bg-blue-100 text-blue-700', icon: Clock },
  confirmed: { label: 'Confirmada', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  waiting: { label: 'En espera', color: 'bg-amber-100 text-amber-700', icon: Hourglass },
  in_progress: { label: 'En curso', color: 'bg-purple-100 text-purple-700', icon: AlertCircle },
  completed: { label: 'Completada', color: 'bg-gray-100 text-gray-600', icon: CheckCircle2 },
  cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-600', icon: XCircle },
  no_show: { label: 'No asistió', color: 'bg-red-100 text-red-600', icon: XCircle },
};

function getStatusConfig(status: string) {
  return STATUS_CONFIG[status] ?? { label: status, color: 'bg-gray-100 text-gray-600', icon: Clock };
}

// ============================================================================
// LOADING SKELETON
// ============================================================================

function AgendaSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 animate-pulse">
          <div className="h-12 w-16 bg-gray-200 rounded" />
          <div className="flex-1">
            <div className="h-4 w-32 bg-gray-200 rounded" />
            <div className="h-3 w-48 bg-gray-100 rounded mt-2" />
          </div>
          <div className="h-6 w-20 bg-gray-200 rounded-full" />
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

export function TodayAgenda({ doctorId, themeColor = '#3B82F6' }: TodayAgendaProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!doctorId) return;

    async function fetchToday() {
      setLoading(true);
      try {
        const today = new Date().toISOString().slice(0, 10);
        const { data, error: queryError } = await supabase
          .from('appointments')
          .select(`
            id,
            fecha_hora,
            duracion_minutos,
            motivo,
            status,
            tipo,
            paciente:profiles!appointments_paciente_id_fkey(
              nombre_completo,
              avatar_url
            )
          `)
          .eq('medico_id', doctorId)
          .gte('fecha_hora', `${today}T00:00:00`)
          .lte('fecha_hora', `${today}T23:59:59`)
          .order('fecha_hora', { ascending: true });

        if (queryError) {
          // Graceful degradation if table doesn't exist yet
          if (queryError.code === '42P01' || queryError.message?.includes('does not exist')) {
            setAppointments([]);
            return;
          }
          throw queryError;
        }

        setAppointments((data as unknown as Appointment[]) ?? []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error cargando agenda');
      } finally {
        setLoading(false);
      }
    }

    fetchToday();

    // Real-time subscription
    const channel = supabase
      .channel(`today-agenda-${doctorId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'appointments',
        filter: `medico_id=eq.${doctorId}`,
      }, () => {
        fetchToday();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [doctorId]);

  if (loading) return <AgendaSkeleton />;

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-50 text-red-600 text-sm">
        <p className="font-medium">Error al cargar la agenda</p>
        <p className="mt-1 text-red-500">{error}</p>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="p-8 text-center">
        <Clock className="h-12 w-12 mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500 font-medium">Sin citas programadas para hoy</p>
        <p className="text-sm text-gray-400 mt-1">Tu agenda está libre</p>
      </div>
    );
  }

  const now = new Date();

  return (
    <div className="space-y-2">
      {appointments.map((apt) => {
        const aptTime = new Date(apt.fecha_hora);
        const isPast = aptTime < now && apt.status !== 'in_progress';
        const isCurrent = apt.status === 'in_progress';
        const statusCfg = getStatusConfig(apt.status);
        const StatusIcon = statusCfg.icon;

        return (
          <div
            key={apt.id}
            className={`
              flex items-center gap-4 p-3 rounded-lg border transition-colors
              ${isCurrent
                ? 'border-2 bg-white shadow-sm'
                : isPast
                  ? 'border-gray-100 bg-gray-50 opacity-75'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }
            `}
            style={isCurrent ? { borderColor: themeColor } : undefined}
          >
            {/* Time block */}
            <div className="text-center min-w-[60px]">
              <p className={`text-lg font-bold ${isCurrent ? '' : isPast ? 'text-gray-400' : 'text-gray-900'}`}
                style={isCurrent ? { color: themeColor } : undefined}
              >
                {aptTime.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-xs text-gray-400">{apt.duracion_minutos || 30} min</p>
            </div>

            {/* Divider */}
            <div
              className="w-0.5 h-10 rounded-full"
              style={{ backgroundColor: isCurrent ? themeColor : '#E5E7EB' }}
            />

            {/* Patient info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className={`text-sm font-medium truncate ${isPast ? 'text-gray-400' : 'text-gray-900'}`}>
                  {apt.paciente?.nombre_completo ?? 'Paciente no asignado'}
                </p>
                {apt.tipo === 'telemedicina' && (
                  <Video className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                )}
              </div>
              {apt.motivo && (
                <p className="text-xs text-gray-400 mt-0.5 truncate">{apt.motivo}</p>
              )}
            </div>

            {/* Status badge */}
            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${statusCfg.color}`}>
              <StatusIcon className="h-3 w-3" />
              {statusCfg.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
