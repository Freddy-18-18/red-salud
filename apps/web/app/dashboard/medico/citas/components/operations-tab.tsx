"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { cn } from "@red-salud/core/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  ScrollArea,
  Separator,
} from "@red-salud/ui";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  Phone,
  Printer,
  Activity,
  FlaskConical,
  Pill,
  AlertCircle,
  TrendingUp,
  Users,
  Calendar,
} from "lucide-react";
import { format, startOfDay, endOfDay } from "date-fns";
import { es } from "date-fns/locale";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface OperationsTabProps {
  selectedOfficeId: string | null;
  specialtyName?: string;
}

interface DailyStats {
  totalAppointments: number;
  confirmedAppointments: number;
  urgentCases: number;
  estimatedRevenue: number;
  occupancyRate: number;
  pendingMaterials: number;
}

interface ChairStatus {
  id: string;
  name: string;
  status: "available" | "occupied" | "cleaning";
  currentPatient?: string;
  nextPatient?: string;
  nextTime?: string;
  estimatedAvailable?: string;
}

interface Alert {
  id: string;
  priority: "urgent" | "high" | "normal";
  type: "patient" | "lab" | "material" | "confirmation";
  message: string;
  patient?: string;
  time?: string;
}

interface TeamChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  assignedTo?: string;
}

/**
 * Tab de Operaciones - Morning Huddle para odontología
 * Vista general del día con alertas, estado de sillas y checklist del equipo
 */
export function OperationsTab({ selectedOfficeId, specialtyName }: OperationsTabProps) {
  const supabase = createClientComponentClient();
  const channelRef = useRef<RealtimeChannel | null>(null);

  const [dailyStats, setDailyStats] = useState<DailyStats>({
    totalAppointments: 0,
    confirmedAppointments: 0,
    urgentCases: 0,
    estimatedRevenue: 0,
    occupancyRate: 0,
    pendingMaterials: 0,
  });

  const [chairStatus, setChairStatus] = useState<ChairStatus[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [checklist, setChecklist] = useState<TeamChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load daily stats from appointments
  const loadDailyStats = useCallback(async () => {
    if (!selectedOfficeId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date();
      const todayStart = startOfDay(today).toISOString();
      const todayEnd = endOfDay(today).toISOString();

      // Query today's appointments with dental details
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select(`
          id,
          medico_id,
          fecha_hora,
          duracion_minutos,
          status,
          price,
          tipo_cita,
          notas,
          dental_details:dental_appointment_details(
            estimated_cost,
            materials_needed,
            materials_prepared
          )
        `)
        .eq('medico_id', user.id)
        .gte('fecha_hora', todayStart)
        .lte('fecha_hora', todayEnd);

      if (error) throw error;

      // Calculate stats
      const totalAppointments = appointments?.length || 0;
      const confirmedAppointments = appointments?.filter(a => a.status === 'confirmada').length || 0;
      const urgentCases = appointments?.filter(a => a.tipo_cita === 'urgencia').length || 0;
      
      // Calculate revenue (use dental estimated_cost if available, fallback to price)
      const estimatedRevenue = appointments?.reduce((sum, a) => {
        const dentalCost = Array.isArray(a.dental_details) && a.dental_details[0]?.estimated_cost 
          ? a.dental_details[0].estimated_cost 
          : 0;
        return sum + (dentalCost || a.price || 0);
      }, 0) || 0;

      // Calculate occupancy rate (assume 8 hours = 480 minutes available per day)
      const totalMinutesUsed = appointments?.reduce((sum, a) => sum + (a.duracion_minutos || 30), 0) || 0;
      const occupancyRate = Math.round((totalMinutesUsed / 480) * 100);

      // Count pending materials
      const pendingMaterials = appointments?.filter(a => {
        const dentalDetails = Array.isArray(a.dental_details) ? a.dental_details[0] : null;
        return dentalDetails?.materials_needed && !dentalDetails.materials_prepared;
      }).length || 0;

      setDailyStats({
        totalAppointments,
        confirmedAppointments,
        urgentCases,
        estimatedRevenue,
        occupancyRate,
        pendingMaterials,
      });
    } catch (error) {
      console.error('Error loading daily stats:', error);
    }
  }, [supabase, selectedOfficeId]);

  // Load chair status with current/next patients
  const loadChairStatus = useCallback(async () => {
    if (!selectedOfficeId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const now = new Date();
      const today = format(now, 'yyyy-MM-dd');

      // Get all chairs for this office
      const { data: chairs, error: chairsError } = await supabase
        .from('dental_chairs')
        .select('id, name, number')
        .eq('office_id', selectedOfficeId)
        .eq('is_active', true)
        .order('number');

      if (chairsError) throw chairsError;

      // For each chair, find current and next appointments
      const chairStatuses: ChairStatus[] = await Promise.all(
        (chairs || []).map(async (chair) => {
          // Find current appointment (ongoing now)
          const { data: currentAppt } = await supabase
            .from('dental_appointment_details')
            .select(`
              appointment_id,
              appointment:appointments!inner(
                id,
                fecha_hora,
                duracion_minutos,
                status,
                paciente_nombre,
                dental_details:dental_appointment_details(procedure_code)
              )
            `)
            .eq('chair_id', chair.id)
            .gte('appointment.fecha_hora', `${today}T00:00:00`)
            .lte('appointment.fecha_hora', `${today}T23:59:59`)
            .eq('appointment.status', 'en_consulta')
            .single();

          // Find next appointment
          const { data: nextAppt } = await supabase
            .from('dental_appointment_details')
            .select(`
              appointment_id,
              appointment:appointments!inner(
                id,
                fecha_hora,
                duracion_minutos,
                status,
                paciente_nombre
              )
            `)
            .eq('chair_id', chair.id)
            .gte('appointment.fecha_hora', now.toISOString())
            .neq('appointment.status', 'en_consulta')
            .order('appointment.fecha_hora', { ascending: true })
            .limit(1)
            .single();

          // Determine status
          let status: ChairStatus['status'] = 'available';
          let currentPatient: string | undefined;
          let nextPatient: string | undefined;
          let nextTime: string | undefined;
          let estimatedAvailable: string | undefined;

          if (currentAppt?.appointment) {
            status = 'occupied';
            const appt = currentAppt.appointment as any;
            const procedure = Array.isArray(appt.dental_details) ? appt.dental_details[0]?.procedure_code : '';
            currentPatient = `${appt.paciente_nombre}${procedure ? ` - ${procedure}` : ''}`;
            
            // Calculate estimated available time
            const startTime = new Date(appt.fecha_hora);
            const endTime = new Date(startTime.getTime() + (appt.duracion_minutos || 30) * 60000);
            const minutesRemaining = Math.max(0, Math.round((endTime.getTime() - now.getTime()) / 60000));
            estimatedAvailable = `${minutesRemaining} min`;
          }

          if (nextAppt?.appointment) {
            const appt = nextAppt.appointment as any;
            nextPatient = appt.paciente_nombre;
            nextTime = format(new Date(appt.fecha_hora), 'HH:mm');
          }

          return {
            id: chair.id,
            name: chair.name,
            status,
            currentPatient,
            nextPatient,
            nextTime,
            estimatedAvailable,
          };
        })
      );

      setChairStatus(chairStatuses);
    } catch (error) {
      console.error('Error loading chair status:', error);
    }
  }, [supabase, selectedOfficeId]);

  // Generate dynamic alerts from appointment data
  const generateAlerts = useCallback(async () => {
    if (!selectedOfficeId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const now = new Date();
      const today = format(now, 'yyyy-MM-dd');
      const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

      // Get today's appointments
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select(`
          id,
          fecha_hora,
          tipo_cita,
          status,
          paciente_nombre,
          notas,
          dental_details:dental_appointment_details(
            requires_anesthesia,
            materials_needed,
            materials_prepared
          )
        `)
        .eq('medico_id', user.id)
        .gte('fecha_hora', `${today}T00:00:00`)
        .lte('fecha_hora', `${today}T23:59:59`);

      if (error) throw error;

      const newAlerts: Alert[] = [];

      // Urgent cases within 2 hours
      appointments?.forEach(appt => {
        const apptTime = new Date(appt.fecha_hora);
        
        if (appt.tipo_cita === 'urgencia' && apptTime <= twoHoursFromNow && apptTime >= now) {
          newAlerts.push({
            id: `urgent-${appt.id}`,
            priority: 'urgent',
            type: 'patient',
            message: appt.notas?.includes('dolor') ? 'Dolor severo - Atención prioritaria' : 'Caso urgente',
            patient: appt.paciente_nombre,
            time: format(apptTime, 'HH:mm'),
          });
        }

        // High priority: Anesthesia + allergy keywords
        const dentalDetails = Array.isArray(appt.dental_details) ? appt.dental_details[0] : null;
        if (dentalDetails?.requires_anesthesia && appt.notas?.toLowerCase().includes('alergia')) {
          newAlerts.push({
            id: `allergy-${appt.id}`,
            priority: 'high',
            type: 'patient',
            message: 'Alergia reportada - Verificar anestesia',
            patient: appt.paciente_nombre,
            time: format(apptTime, 'HH:mm'),
          });
        }

        // High priority: Materials not prepared within 1 hour
        const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
        if (dentalDetails?.materials_needed && !dentalDetails.materials_prepared && apptTime <= oneHourFromNow && apptTime >= now) {
          newAlerts.push({
            id: `materials-${appt.id}`,
            priority: 'high',
            type: 'material',
            message: 'Materiales pendientes de preparar',
            patient: appt.paciente_nombre,
            time: format(apptTime, 'HH:mm'),
          });
        }

        // Normal: Pending confirmations within 24 hours
        const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        if (appt.status === 'pendiente' && apptTime <= twentyFourHoursFromNow && apptTime >= now) {
          newAlerts.push({
            id: `confirm-${appt.id}`,
            priority: 'normal',
            type: 'confirmation',
            message: 'Cita pendiente de confirmación',
            patient: appt.paciente_nombre,
            time: format(apptTime, 'HH:mm'),
          });
        }
      });

      setAlerts(newAlerts);
    } catch (error) {
      console.error('Error generating alerts:', error);
    }
  }, [supabase, selectedOfficeId]);

  // Load team checklist from database
  const loadChecklist = useCallback(async () => {
    if (!selectedOfficeId) return;

    try {
      const today = format(new Date(), 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('daily_team_checklist')
        .select('items')
        .eq('office_id', selectedOfficeId)
        .eq('date', today)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
        throw error;
      }

      if (data?.items) {
        setChecklist(data.items as TeamChecklistItem[]);
      } else {
        // Initialize with default checklist
        const defaultChecklist: TeamChecklistItem[] = [
          { id: "1", title: "Esterilización completada", completed: false },
          { id: "2", title: "Materiales del día verificados", completed: false },
          { id: "3", title: "Confirmaciones de citas realizadas", completed: false },
          { id: "4", title: "RX listas para revisión", completed: false },
          { id: "5", title: "Laboratorio: Verificar trabajos pendientes", completed: false },
        ];

        // Save to database
        await supabase
          .from('daily_team_checklist')
          .insert({
            office_id: selectedOfficeId,
            date: today,
            items: defaultChecklist,
          });

        setChecklist(defaultChecklist);
      }
    } catch (error) {
      console.error('Error loading checklist:', error);
    }
  }, [supabase, selectedOfficeId]);

  // Toggle checklist item and persist to database
  const toggleChecklistItem = async (id: string) => {
    if (!selectedOfficeId) return;

    const updatedChecklist = checklist.map((item) =>
      item.id === id 
        ? { ...item, completed: !item.completed, completedAt: !item.completed ? new Date().toISOString() : undefined } 
        : item
    );

    // Optimistic update
    setChecklist(updatedChecklist);

    try {
      const today = format(new Date(), 'yyyy-MM-dd');

      const { error } = await supabase
        .from('daily_team_checklist')
        .update({ items: updatedChecklist })
        .eq('office_id', selectedOfficeId)
        .eq('date', today);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating checklist:', error);
      // Rollback on error
      setChecklist(checklist);
    }
  };

  // Load all data on mount and when office changes
  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      await Promise.all([
        loadDailyStats(),
        loadChairStatus(),
        generateAlerts(),
        loadChecklist(),
      ]);
      setLoading(false);
    };

    loadAllData();
  }, [selectedOfficeId, loadDailyStats, loadChairStatus, generateAlerts, loadChecklist]);

  // Refresh chair status every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadChairStatus();
      generateAlerts();
    }, 60000);

    return () => clearInterval(interval);
  }, [loadChairStatus, generateAlerts]);

  // Setup realtime subscriptions
  useEffect(() => {
    if (!selectedOfficeId) return;

    // Subscribe to appointment changes
    const channel = supabase
      .channel('operations-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
        },
        () => {
          // Refresh all data when appointments change
          loadDailyStats();
          loadChairStatus();
          generateAlerts();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'dental_appointment_details',
        },
        () => {
          // Refresh when dental details change
          loadChairStatus();
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [supabase, selectedOfficeId, loadDailyStats, loadChairStatus, generateAlerts]);

  const getPriorityColor = (priority: Alert["priority"]) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300";
    }
  };

  const getPriorityIcon = (priority: Alert["priority"]) => {
    switch (priority) {
      case "urgent":
        return <AlertTriangle className="size-4" />;
      case "high":
        return <AlertCircle className="size-4" />;
      default:
        return <Activity className="size-4" />;
    }
  };

  const getChairStatusColor = (status: ChairStatus["status"]) => {
    switch (status) {
      case "available":
        return "bg-green-500";
      case "occupied":
        return "bg-red-500";
      case "cleaning":
        return "bg-yellow-500";
    }
  };

  const completionRate = checklist.length > 0 
    ? (checklist.filter((i) => i.completed).length / checklist.length) * 100 
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Activity className="size-8 animate-spin mx-auto text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">Cargando datos operacionales...</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        {/* Header con fecha */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Morning Huddle</h2>
            <p className="text-sm text-muted-foreground">
              {format(new Date(), "EEEE, d 'de' MMMM yyyy", { locale: es })}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Phone className="size-4 mr-2" />
              Llamar Pendientes
            </Button>
            <Button variant="outline" size="sm">
              <Printer className="size-4 mr-2" />
              Imprimir Agenda
            </Button>
          </div>
        </div>

        {/* Estadísticas del día */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Citas</p>
                  <p className="text-2xl font-bold">{dailyStats.totalAppointments}</p>
                </div>
                <Calendar className="size-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Confirmadas</p>
                  <p className="text-2xl font-bold">{dailyStats.confirmedAppointments}</p>
                </div>
                <CheckCircle2 className="size-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Urgencias</p>
                  <p className="text-2xl font-bold text-red-500">{dailyStats.urgentCases}</p>
                </div>
                <AlertTriangle className="size-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Revenue Est.</p>
                  <p className="text-2xl font-bold">${dailyStats.estimatedRevenue}</p>
                </div>
                <DollarSign className="size-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ocupación</p>
                  <p className="text-2xl font-bold">{dailyStats.occupancyRate}%</p>
                </div>
                <TrendingUp className="size-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Materiales</p>
                  <p className="text-2xl font-bold">{dailyStats.pendingMaterials}</p>
                </div>
                <Pill className="size-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Estado de Sillas en Tiempo Real */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="size-5" />
                Estado del Consultorio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {chairStatus.map((chair) => (
                <div key={chair.id} className="flex items-start gap-3 p-3 rounded-lg border">
                  <div className={cn("size-3 rounded-full mt-1.5", getChairStatusColor(chair.status))} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{chair.name}</p>
                    {chair.status === "occupied" && chair.currentPatient && (
                      <p className="text-sm text-muted-foreground">
                        {chair.currentPatient}
                        {chair.estimatedAvailable && ` - ${chair.estimatedAvailable}`}
                      </p>
                    )}
                    {chair.status === "available" && chair.nextPatient && (
                      <p className="text-sm text-muted-foreground">
                        Próximo: {chair.nextTime} - {chair.nextPatient}
                      </p>
                    )}
                    {chair.status === "cleaning" && chair.estimatedAvailable && (
                      <p className="text-sm text-muted-foreground">
                        Disponible en {chair.estimatedAvailable}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Alertas y Prioridades */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="size-5" />
                Alertas y Prioridades
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg",
                    getPriorityColor(alert.priority)
                  )}
                >
                  {getPriorityIcon(alert.priority)}
                  <div className="flex-1 min-w-0">
                    {alert.patient && (
                      <p className="font-medium">
                        {alert.patient}
                        {alert.time && <span className="text-sm ml-2">({alert.time})</span>}
                      </p>
                    )}
                    <p className="text-sm">{alert.message}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Team Checklist */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="size-5" />
                Checklist del Equipo
              </CardTitle>
              <Badge variant="secondary">
                {Math.round(completionRate)}% Completado
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {checklist.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg border">
                  <button
                    onClick={() => toggleChecklistItem(item.id)}
                    className={cn(
                      "size-5 rounded border-2 flex items-center justify-center transition-colors",
                      item.completed
                        ? "bg-primary border-primary"
                        : "border-muted-foreground/30 hover:border-primary"
                    )}
                  >
                    {item.completed && <CheckCircle2 className="size-3 text-primary-foreground" />}
                  </button>
                  <div className="flex-1">
                    <p className={cn("font-medium", item.completed && "line-through text-muted-foreground")}>
                      {item.title}
                    </p>
                    {item.assignedTo && (
                      <p className="text-xs text-muted-foreground">Asignado: {item.assignedTo}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Production Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="size-5" />
              Objetivos de Producción
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Meta Diaria</span>
                <span className="font-medium">$3,000</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Actual</span>
                <span className="font-medium text-green-600">${dailyStats.estimatedRevenue}</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                  style={{ width: `${(dailyStats.estimatedRevenue / 3000) * 100}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Citas restantes: 4 citas ($550 estimado)
              </p>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Objetivo Semanal</p>
                <p className="text-lg font-semibold">$15,000</p>
              </div>
              <div>
                <p className="text-muted-foreground">Proyección</p>
                <p className="text-lg font-semibold text-green-600">$16,200</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
