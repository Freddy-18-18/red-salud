'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  BellOff,
  CalendarCheck2,
  CalendarDays,
  Check,
  Clock,
  Copy,
  CreditCard,
  FileText,
  Heart,
  Info,
  MessageCircle,
  Paperclip,
  Phone,
  RefreshCw,
  Shield,
  ShieldAlert,
  Siren,
  Sparkles,
  Stethoscope,
  User,
  Video,
} from 'lucide-react';

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@red-salud/design-system';
import {
  useAvailabilityExceptions,
  useDoctorAppointments,
  useDoctorSchedule,
  useTimeBlocks,
  type AppointmentRow,
  type AvailabilityExceptionRow,
  type TimeBlockRow,
  type WeeklyScheduleRow,
} from '@red-salud/core';

import { supabase } from '@/lib/supabase/client';
import { useActiveSede } from '@/hooks/use-active-sede';

import { PatientPicker, type SelectedPatient } from './_components/patient-picker';
import { ReasonAutocomplete } from './_components/reason-autocomplete';
import { DatePickerDark } from './_components/date-picker-dark';
import { TimePickerGrid } from './_components/time-picker-grid';
import { findNextAvailableSlot } from './_components/next-slot-finder';
import {
  validateSlot,
  type SlotValidationResult,
} from './_components/slot-validation';
import {
  PaymentField,
  type PaymentMethod,
} from './_components/payment-field';
import { PreparationChips } from './_components/preparation-chips';
import { generateMeetingUrl } from './_components/meeting-link';
import {
  CompanionField,
  isCompanionRequired,
  isCompanionComplete,
  type CompanionData,
} from './_components/companion-field';
import {
  InsuranceField,
  type InsuranceEntry,
} from './_components/insurance-field';
import {
  AttachmentsField,
  uploadAttachments,
} from './_components/attachments-field';
import { WizardStep } from './_components/wizard-step';
import { WizardNav } from './_components/wizard-nav';
import { ReviewStep } from './_components/review-step';
import { useFrequentReasons } from './_hooks/use-frequent-reasons';
import { useFrequentPreparations } from './_hooks/use-frequent-preparations';
import { usePracticeLocations } from './_hooks/use-practice-locations';
import { useDoctorPrice } from './_hooks/use-doctor-price';
import { usePatientBirthDate } from './_hooks/use-patient-birth-date';

// ============================================================================
// CONSTANTS
// ============================================================================

const APPOINTMENT_TYPES = [
  { value: 'in_person', label: 'Presencial', icon: Stethoscope, activeRing: 'ring-info', activeBg: 'bg-info/10', activeText: 'text-info' },
  { value: 'first_visit', label: 'Primera vez', icon: Heart, activeRing: 'ring-warning', activeBg: 'bg-warning/10', activeText: 'text-warning' },
  { value: 'follow_up', label: 'Control', icon: RefreshCw, activeRing: 'ring-success', activeBg: 'bg-success/10', activeText: 'text-success' },
  { value: 'telemedicine', label: 'Online', icon: Video, activeRing: 'ring-violet-500', activeBg: 'bg-violet-500/10', activeText: 'text-violet-600 dark:text-violet-300' },
  { value: 'emergency', label: 'Urgencia', icon: Siren, activeRing: 'ring-destructive', activeBg: 'bg-destructive/10', activeText: 'text-destructive' },
] as const;

const DURATION_OPTIONS = [
  { value: '15', label: '15 min' },
  { value: '30', label: '30 min' },
  { value: '45', label: '45 min' },
  { value: '60', label: '1 hora' },
  { value: '90', label: '1h 30min' },
] as const;

const NOTIFY_CHANNELS = [
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, hint: 'Más usado · gratis' },
  { value: 'sms', label: 'SMS', icon: Phone, hint: 'Universal · costo bajo' },
] as const;

const ADVANCE_OPTIONS = [
  { value: '24h', label: '24h antes' },
  { value: '2h', label: '2h antes' },
  { value: '30min', label: '30 min antes' },
] as const;

const INPUT_BASE =
  'flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30';

// IDs de cada step (orden de la wizard).
// Wizard consolidado en 4 pasos (sin contar `companion` que es condicional):
//   1. `essentials`  → paciente + cuándo + motivo (datos críticos)
//   2. `companion`   → solo si paciente es menor
//   3. `secondary`   → pago + seguros + archivos + aviso (todo lo demás)
//   4. `review`      → revisar y confirmar
type StepId = 'essentials' | 'companion' | 'secondary' | 'review';

// ============================================================================
// HELPERS
// ============================================================================

function formatDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function snapTo15(time: string): string {
  const [h = '0', m = '0'] = time.split(':');
  const mins = Number(h) * 60 + Number(m);
  const snapped = Math.round(mins / 15) * 15;
  const hh = String(Math.floor(snapped / 60) % 24).padStart(2, '0');
  const mm = String(snapped % 60).padStart(2, '0');
  return `${hh}:${mm}`;
}

function defaultTime(): string {
  const now = new Date();
  const mins = now.getHours() * 60 + now.getMinutes();
  const next = Math.ceil((mins + 1) / 15) * 15;
  const hh = String(Math.min(23, Math.floor(next / 60))).padStart(2, '0');
  const mm = String(next % 60).padStart(2, '0');
  return `${hh}:${mm}`;
}

function addDaysIso(baseIso: string, days: number): string {
  const d = new Date(`${baseIso}T12:00:00`);
  d.setDate(d.getDate() + days);
  return formatDateKey(d);
}

const EMPTY_COMPANION: CompanionData = { name: '', relationship: '', phone: '' };

// ============================================================================
// PAGE
// ============================================================================

export default function NuevaCitaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [userId, setUserId] = useState<string | null>(null);

  const initialDate = useMemo(
    () => searchParams?.get('fecha') ?? formatDateKey(new Date()),
    [searchParams],
  );
  const initialTime = useMemo(
    () => snapTo15(searchParams?.get('hora') ?? defaultTime()),
    [searchParams],
  );

  // ---- Form state ---------------------------------------------------------
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState(initialTime);
  const [durationMin, setDurationMin] = useState(30);
  const [appointmentType, setAppointmentType] = useState<string>('in_person');
  const [reason, setReason] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<SelectedPatient | null>(null);
  const [notifyEnabled, setNotifyEnabled] = useState(true);
  const [notifyChannel, setNotifyChannel] = useState<'whatsapp' | 'sms'>('whatsapp');
  const [notifyAdvance, setNotifyAdvance] = useState<Set<string>>(new Set(['24h']));
  // Preparaciones como string separado por comas. Al guardar la cita,
  // parseamos a text[] para la columna `appointments.preparation_items`.
  const [preparations, setPreparations] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash_usd');
  const [paymentAmount, setPaymentAmount] = useState<number | null>(null);
  const [companion, setCompanion] = useState<CompanionData>(EMPTY_COMPANION);
  const [insurance, setInsurance] = useState<InsuranceEntry[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [selectedSedeId, setSelectedSedeId] = useState<string | null>(null);
  const [meetingUrl, setMeetingUrl] = useState<string | null>(null);
  const [copiedMeeting, setCopiedMeeting] = useState(false);

  const [overrideWarnings, setOverrideWarnings] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // ---- Wizard navigation state -------------------------------------------
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  /**
   * Steps que el doctor CONFIRMÓ (presionando "Siguiente" desde ellos).
   * Esto evita el caso engañoso donde un step con defaults razonables (ej:
   * schedule con hoy + ahora + 30min + presencial) se marcaba como "completed"
   * con tilde verde EN EL MOMENTO de entrar, sin que el doctor hubiera
   * revisado ni aprobado los datos. Ahora el verde aparece solo después de
   * que el doctor avanza intencionalmente.
   *
   * Si los datos del step se vuelven inválidos después de confirmar (ej:
   * cambia la hora y choca con otra cita), el step deja de mostrarse "verde"
   * porque el render combina `confirmed && completed`.
   */
  const [confirmedSteps, setConfirmedSteps] = useState<Set<StepId>>(new Set());

  // ---- Identity + datasets -----------------------------------------------
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  const { activeSedeId } = useActiveSede();
  const { sedes, primary: primarySede } = usePracticeLocations(userId);
  const { weeklySchedule } = useDoctorSchedule(supabase, userId);
  const { timeBlocks } = useTimeBlocks(supabase, userId);
  const { exceptions } = useAvailabilityExceptions(supabase, userId);
  const { appointments: dayAppointments } = useDoctorAppointments(
    supabase,
    userId,
    { dateRange: { start: date, end: date }, locationId: activeSedeId },
  );
  const { reasons: frequentReasons, loading: reasonsLoading } = useFrequentReasons(userId);
  const { items: frequentPreparations } = useFrequentPreparations(userId);
  const { price: doctorSuggestedPrice } = useDoctorPrice(userId);
  const patientBirthDate = usePatientBirthDate(selectedPatient);

  // Inicializar sede
  useEffect(() => {
    if (selectedSedeId || sedes.length === 0) return;
    const fromActive = activeSedeId ? sedes.find((s) => s.id === activeSedeId) : undefined;
    setSelectedSedeId(fromActive?.id ?? primarySede?.id ?? sedes[0]?.id ?? null);
  }, [sedes, activeSedeId, primarySede, selectedSedeId]);

  // Meeting URL para telemedicine
  useEffect(() => {
    if (appointmentType === 'telemedicine' && userId) {
      setMeetingUrl((prev) => prev ?? generateMeetingUrl({ doctorId: userId, date, time }));
    } else {
      setMeetingUrl(null);
    }
    setCopiedMeeting(false);
  }, [appointmentType, userId, date, time]);

  // ---- Slot validation ----------------------------------------------------
  const validation = useMemo(
    () =>
      validateSlot({
        date,
        time,
        durationMin,
        weeklySchedule,
        timeBlocks,
        exceptions,
        appointments: dayAppointments,
      }),
    [date, time, durationMin, weeklySchedule, timeBlocks, exceptions, dayAppointments],
  );

  useEffect(() => {
    setOverrideWarnings(false);
    setSubmitError(null);
  }, [date, time, durationMin]);

  // ---- Completion flags --------------------------------------------------
  const patientComplete = !!selectedPatient;
  // schedule está completo si tiene fecha/hora/tipo válidos Y el slot pasa la
  // validación (no choca con otra cita, no cae en bloqueo, no es día cerrado).
  // hasWarnings NO bloquea — el doctor puede overrideearlas en review.
  const scheduleComplete =
    !!date && !!time && !!durationMin && !!appointmentType && !validation.hasErrors;
  const detailsComplete = reason.trim().length > 0;
  const companionRequired = isCompanionRequired(patientBirthDate);
  const companionComplete = !companionRequired || isCompanionComplete(companion);
  // payment: cortesía no necesita monto; el resto sí, y debe ser > 0
  // (paymentAmount != null aceptaba 0, lo cual no tiene sentido como cobro).
  const paymentComplete =
    paymentMethod === 'courtesy' || (paymentAmount != null && paymentAmount > 0);

  // Counts de opcionales — usados en el stepper para mostrar badges honestos
  // ("Seguros · 2", "Archivos · 3") y para decidir cuándo marcar el step
  // opcional como "tiene contenido" (touched) vs vacío default.
  const insuranceCount = useMemo(
    () =>
      insurance.filter(
        (e) => !!e.provider_id && e.policy_number.trim().length > 0,
      ).length,
    [insurance],
  );
  const attachmentsCount = attachments.length;
  const notifyTouched = !notifyEnabled || internalNotes.trim().length > 0;

  // ---- Wizard steps configuration ----------------------------------------
  // Cada step define id, label, icon, si es opcional, visible, y un
  // `completed` que SOLO refleja datos válidos. La confirmación visual
  // (tilde verde) requiere ADEMÁS que el step esté en `confirmedSteps`.
  const wizardSteps: Array<{
    id: StepId;
    label: string;
    icon: typeof User;
    optional: boolean;
    visible: boolean;
    /** Datos válidos en el step (no implica que el doctor lo haya confirmado). */
    completed: boolean;
    required: boolean;
    title: string;
    description?: string;
  }> = useMemo(
    () => [
      {
        id: 'essentials',
        label: 'Datos cita',
        icon: CalendarDays,
        optional: false,
        visible: true,
        // El step "Datos esenciales" requiere los 3 sub-bloques completos:
        // paciente seleccionado + horario válido + motivo escrito.
        completed: patientComplete && scheduleComplete && detailsComplete,
        required: !(patientComplete && scheduleComplete && detailsComplete),
        title: 'Datos de la cita',
        description: 'Paciente, horario y motivo — todo lo crítico en un solo paso.',
      },
      {
        id: 'companion',
        label: 'Acompañante',
        icon: ShieldAlert,
        optional: false,
        visible: companionRequired,
        completed: companionComplete,
        required: companionRequired && !companionComplete,
        title: 'Acompañante / responsable legal',
        description: 'El paciente es menor de edad — necesitamos los datos del adulto responsable.',
      },
      {
        // Step consolidado "secondary": pago (required) + seguros, archivos,
        // aviso (todos opcionales). El step se considera completed solo si
        // el pago está OK — el resto son opcionales por naturaleza.
        id: 'secondary',
        label: 'Pago y extras',
        icon: CreditCard,
        optional: false,
        visible: true,
        completed: paymentComplete,
        required: !paymentComplete,
        title: 'Pago, seguros, archivos y aviso',
        description:
          'Pago obligatorio. Seguros, archivos y aviso al paciente son opcionales.',
      },
      {
        id: 'review',
        label: 'Revisar',
        icon: CalendarCheck2,
        optional: false,
        visible: true,
        completed: false,
        required: false,
        title: 'Revisar y confirmar',
        description: 'Verificá los datos antes de crear la cita.',
      },
    ],
    [
      patientComplete,
      scheduleComplete,
      detailsComplete,
      companionRequired,
      companionComplete,
      paymentComplete,
    ],
  );

  // Solo los visibles para navegación
  const visibleSteps = useMemo(() => wizardSteps.filter((s) => s.visible), [wizardSteps]);
  const currentStep = visibleSteps[currentStepIdx];

  // Clamp idx si visibleSteps cambia (ej: aparece companion porque cambió paciente)
  useEffect(() => {
    if (currentStepIdx >= visibleSteps.length) {
      setCurrentStepIdx(Math.max(0, visibleSteps.length - 1));
    }
  }, [visibleSteps.length, currentStepIdx]);

  // ---- Navigation handlers ------------------------------------------------
  const canGoPrevious = currentStepIdx > 0;
  const isLastStep = currentStep?.id === 'review';

  /** El step actual permite avanzar? Lógica especial por step. */
  const canGoNextFromCurrent = useMemo(() => {
    if (!currentStep) return false;
    if (currentStep.optional) return true;
    if (currentStep.id === 'review') {
      return (
        patientComplete &&
        scheduleComplete &&
        detailsComplete &&
        paymentComplete &&
        companionComplete &&
        !validation.hasErrors &&
        (!validation.hasWarnings || overrideWarnings) &&
        !!selectedSedeId
      );
    }
    return currentStep.completed;
  }, [
    currentStep,
    patientComplete,
    scheduleComplete,
    detailsComplete,
    paymentComplete,
    companionComplete,
    validation.hasErrors,
    validation.hasWarnings,
    overrideWarnings,
    selectedSedeId,
  ]);

  const blockedReason = useMemo(() => {
    if (!currentStep || canGoNextFromCurrent) return null;
    switch (currentStep.id) {
      case 'essentials':
        // Priorizar el bloque incompleto MÁS ARRIBA visualmente, así el
        // doctor scrollea menos para encontrar qué arreglar.
        if (!patientComplete) return 'Elegí un paciente para continuar.';
        if (!date || !time) return 'Completá fecha y hora de la cita.';
        if (validation.hasErrors) {
          const err = validation.issues.find((i) => i.severity === 'error');
          return err ? `${err.message} — revisá el horario.` : 'Hay un conflicto en el horario.';
        }
        if (!scheduleComplete) return 'Completá fecha, hora, duración y tipo.';
        if (!detailsComplete) return 'Escribí el motivo de la consulta.';
        return 'Completá los datos esenciales de la cita.';
      case 'companion':
        if (!companion.name.trim()) return 'Falta el nombre del responsable.';
        if (!companion.relationship) return 'Elegí el parentesco del responsable.';
        return 'Completá los datos del acompañante.';
      case 'secondary':
        // Solo el pago es required en este step. Las otras 3 sub-secciones
        // (seguros, archivos, aviso) son opcionales.
        if (paymentMethod === 'courtesy') return null;
        if (paymentAmount == null || paymentAmount <= 0)
          return 'Ingresá el monto a cobrar (mayor a 0).';
        return 'Elegí un método de pago y un monto válido.';
      case 'review':
        if (validation.hasErrors) return 'Hay conflictos en el horario — revisá la disponibilidad.';
        if (validation.hasWarnings && !overrideWarnings) return 'Confirmá las advertencias para continuar.';
        if (!selectedSedeId) return 'Elegí una sede.';
        return 'Hay datos pendientes — revisá los pasos anteriores.';
      default:
        return null;
    }
  }, [
    currentStep,
    canGoNextFromCurrent,
    date,
    time,
    validation,
    overrideWarnings,
    selectedSedeId,
    companion,
    paymentMethod,
    paymentAmount,
    patientComplete,
    scheduleComplete,
    detailsComplete,
  ]);

  const handleGoTo = useCallback(
    (idx: number) => {
      const clamped = Math.max(0, Math.min(idx, visibleSteps.length - 1));
      setCurrentStepIdx(clamped);
    },
    [visibleSteps.length],
  );

  const handlePrevious = useCallback(() => {
    handleGoTo(currentStepIdx - 1);
  }, [currentStepIdx, handleGoTo]);

  const handleNext = useCallback(() => {
    // Marcar el step actual como confirmado por el doctor. La tilde verde
    // del stepper solo aparece tras esta acción, no por defaults.
    const current = visibleSteps[currentStepIdx];
    if (current) {
      setConfirmedSteps((prev) => {
        if (prev.has(current.id)) return prev;
        const next = new Set(prev);
        next.add(current.id);
        return next;
      });
    }
    handleGoTo(currentStepIdx + 1);
  }, [currentStepIdx, visibleSteps, handleGoTo]);

  const handleSkip = useCallback(() => {
    // Skip = avanzar sin confirmar (solo para steps opcionales). NO marca
    // el step como confirmado — queda pendiente, lo que es honesto.
    handleGoTo(currentStepIdx + 1);
  }, [currentStepIdx, handleGoTo]);

  // ---- Find next slot ----------------------------------------------------
  const [findingSlot, setFindingSlot] = useState(false);

  const handleFindNextSlot = useCallback(() => {
    if (!userId) return;
    setFindingSlot(true);
    const fromCandidate = new Date(`${date}T${time}:00`);
    const now = new Date();
    const from = fromCandidate > now ? fromCandidate : now;

    const next = findNextAvailableSlot({
      from, durationMin, weeklySchedule, timeBlocks, exceptions, appointments: dayAppointments,
    });
    setFindingSlot(false);

    if (next) {
      setDate(next.date);
      setTime(next.time);
    } else {
      setSubmitError('No encontramos un slot libre en los próximos 30 días.');
    }
  }, [date, time, durationMin, userId, weeklySchedule, timeBlocks, exceptions, dayAppointments]);

  const handleCopyMeeting = useCallback(async () => {
    if (!meetingUrl) return;
    try {
      await navigator.clipboard.writeText(meetingUrl);
      setCopiedMeeting(true);
      setTimeout(() => setCopiedMeeting(false), 2000);
    } catch {
      // Silently ignore clipboard errors
    }
  }, [meetingUrl]);

  // ---- Submit -------------------------------------------------------------
  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setSubmitError(null);
      if (!userId || !selectedPatient || !selectedSedeId) return;

      setSubmitting(true);
      try {
        const scheduledAt = `${date}T${time}:00`;
        const insertData: Record<string, unknown> = {
          doctor_id: userId,
          scheduled_at: scheduledAt,
          duration_minutes: durationMin,
          reason: reason.trim() || '—',
          appointment_type: appointmentType,
          status: 'scheduled',
          location_id: selectedSedeId,
          internal_notes: internalNotes.trim() || null,
          notification_enabled: notifyEnabled,
          notification_channel: notifyEnabled ? notifyChannel : null,
          notification_advance: notifyEnabled ? Array.from(notifyAdvance) : [],
          // preparations es string CSV — parseamos a text[] al guardar.
          preparation_items: preparations
            .split(',')
            .map((s) => s.trim())
            .filter((s) => s.length > 0),
          companion_name: companionRequired ? companion.name.trim() || null : null,
          companion_relationship: companionRequired ? companion.relationship || null : null,
          companion_phone: companionRequired ? companion.phone.trim() || null : null,
        };
        if (paymentAmount != null) insertData.price = paymentAmount;
        insertData.payment_method = paymentMethod;
        if (meetingUrl) insertData.meeting_url = meetingUrl;
        if (selectedPatient.kind === 'offline') {
          insertData.offline_patient_id = selectedPatient.offline_patient_id;
        } else {
          insertData.patient_id = selectedPatient.patient_id;
        }

        const { data: createdAppt, error } = await supabase
          .from('appointments')
          .insert(insertData)
          .select('id')
          .single();

        if (error || !createdAppt) {
          setSubmitError(error?.message ?? 'No pudimos crear la cita.');
          return;
        }

        const appointmentId = createdAppt.id;
        const postInsertErrors: string[] = [];

        const validInsurance = insurance.filter((e) => e.provider_id && e.policy_number.trim().length > 0);
        if (validInsurance.length > 0) {
          const { error: insErr } = await supabase
            .from('appointment_insurance')
            .insert(validInsurance.map((e) => ({
              appointment_id: appointmentId,
              provider_id: e.provider_id,
              policy_number: e.policy_number.trim(),
              holder_name: e.holder_name?.trim() || null,
              authorized_amount: e.authorized_amount,
            })));
          if (insErr) postInsertErrors.push(`Aseguradoras: ${insErr.message}`);
        }

        if (attachments.length > 0) {
          const { failed } = await uploadAttachments(appointmentId, attachments);
          if (failed.length > 0) postInsertErrors.push(`Archivos: ${failed.join(' / ')}`);
        }

        if (notifyEnabled && notifyAdvance.size > 0) {
          const { error: rpcErr } = await supabase.rpc('schedule_appointment_notifications', { p_appointment_id: appointmentId });
          if (rpcErr) postInsertErrors.push(`Notificaciones: ${rpcErr.message}`);
        }

        if (postInsertErrors.length > 0) {
          console.warn('[nueva-cita] post-insert errors', postInsertErrors);
        }

        router.push('/dashboard/agenda');
        router.refresh();
      } catch (err) {
        setSubmitError((err as Error)?.message ?? 'Error inesperado.');
      } finally {
        setSubmitting(false);
      }
    },
    [
      appointmentType, attachments, companion, companionRequired, date, durationMin,
      insurance, internalNotes, meetingUrl, notifyAdvance, notifyChannel, notifyEnabled,
      paymentAmount, paymentMethod, preparations, reason, router, selectedPatient,
      selectedSedeId, time, userId,
    ],
  );

  // ---- Render -------------------------------------------------------------
  if (!currentStep) return null;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-2 px-3 lg:px-4">
      {/* Volver link compacto (sin stepper visual — el WizardNav abajo
          maneja la navegación; el "Paso N/M" mini en el header del step
          es el único indicador, suficiente para orientar). */}
      <Link
        href="/dashboard/agenda"
        className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Volver a la agenda
      </Link>

      <form onSubmit={handleSubmit}>
        {/* Body del step actual — padding ajustado para mayor densidad útil */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
          <WizardStep
            id={currentStep.id}
            icon={currentStep.icon}
            title={currentStep.title}
            description={currentStep.description}
            optional={currentStep.optional}
            stepNumber={currentStepIdx + 1}
            totalSteps={visibleSteps.length}
          >
            {/* Switch por step.id */}
            {currentStep.id === 'essentials' && (
              <EssentialsStepContent
                // patient
                selectedPatient={selectedPatient}
                onPatientChange={setSelectedPatient}
                patientComplete={patientComplete}
                // schedule
                date={date}
                onDateChange={setDate}
                time={time}
                onTimeChange={(v) => setTime(snapTo15(v))}
                durationMin={durationMin}
                onDurationChange={setDurationMin}
                appointmentType={appointmentType}
                onTypeChange={setAppointmentType}
                meetingUrl={meetingUrl}
                copiedMeeting={copiedMeeting}
                onCopyMeeting={handleCopyMeeting}
                findingSlot={findingSlot}
                onFindNextSlot={handleFindNextSlot}
                userId={userId}
                validation={validation}
                weeklySchedule={weeklySchedule}
                timeBlocks={timeBlocks}
                dayAppointments={dayAppointments}
                availabilityExceptions={exceptions}
                // details
                reason={reason}
                onReasonChange={setReason}
                frequentReasons={frequentReasons}
                reasonsLoading={reasonsLoading}
                preparations={preparations}
                onPreparationsChange={setPreparations}
                frequentPreparations={frequentPreparations}
              />
            )}

            {currentStep.id === 'companion' && (
              <CompanionField
                patientBirthDate={patientBirthDate}
                value={companion}
                onChange={setCompanion}
              />
            )}

            {currentStep.id === 'secondary' && (
              <SecondaryStepContent
                // pago
                paymentMethod={paymentMethod}
                onPaymentMethodChange={setPaymentMethod}
                paymentAmount={paymentAmount}
                onPaymentAmountChange={setPaymentAmount}
                doctorSuggestedPrice={doctorSuggestedPrice}
                paymentComplete={paymentComplete}
                // seguros
                insurance={insurance}
                onInsuranceChange={setInsurance}
                insuranceCount={insuranceCount}
                // archivos
                attachments={attachments}
                onAttachmentsChange={setAttachments}
                attachmentsCount={attachmentsCount}
                // aviso
                notifyEnabled={notifyEnabled}
                onNotifyEnabledChange={setNotifyEnabled}
                notifyChannel={notifyChannel}
                onNotifyChannelChange={setNotifyChannel}
                notifyAdvance={notifyAdvance}
                onNotifyAdvanceChange={setNotifyAdvance}
                hasContact={!!selectedPatient}
                internalNotes={internalNotes}
                onInternalNotesChange={setInternalNotes}
              />
            )}

            {currentStep.id === 'review' && (
              <ReviewStep
                patient={selectedPatient}
                date={date}
                time={time}
                durationMin={durationMin}
                appointmentType={appointmentType}
                reason={reason}
                preparations={preparations}
                companion={companion}
                companionRequired={companionRequired}
                paymentMethod={paymentMethod}
                paymentAmount={paymentAmount}
                notifyEnabled={notifyEnabled}
                notifyChannel={notifyChannel}
                notifyAdvance={notifyAdvance}
                attachments={attachments}
                meetingUrl={meetingUrl}
                internalNotes={internalNotes}
                sedes={sedes}
                selectedSedeId={selectedSedeId}
                onSedeChange={setSelectedSedeId}
                issues={validation.issues}
                validationOk={validation.ok && !validation.hasWarnings}
                dayAppointments={dayAppointments}
                hasWarnings={validation.hasWarnings && !validation.hasErrors}
                overrideWarnings={overrideWarnings}
                onOverrideWarningsChange={setOverrideWarnings}
              />
            )}
          </WizardStep>
        </div>

        {/* Error final */}
        {submitError && (
          <Alert variant="destructive" className="mt-3">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>No pudimos crear la cita</AlertTitle>
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        {/* Wizard nav sticky */}
        <WizardNav
          canGoPrevious={canGoPrevious}
          canGoNext={canGoNextFromCurrent}
          isLastStep={isLastStep}
          isOptional={currentStep.optional}
          blockedReason={blockedReason}
          submitting={submitting}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onSkip={handleSkip}
          onCancel={() => router.push('/dashboard/agenda')}
        />
      </form>
    </div>
  );
}

// ============================================================================
// STEP CONTENT COMPONENTS
// ============================================================================

/**
 * Mini-header de sección dentro del step "Essentials". Muestra número,
 * icono, título y un check verde cuando la sub-sección está completa.
 * Ayuda al doctor a ver en un vistazo qué le falta sin scrollear todo.
 */
function SectionHeader({
  number,
  icon: Icon,
  title,
  hint,
  complete,
}: {
  number: number;
  icon: typeof User;
  title: string;
  hint?: string;
  complete: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
          complete
            ? 'bg-success/15 text-success ring-1 ring-inset ring-success/30'
            : 'bg-muted text-muted-foreground ring-1 ring-inset ring-border'
        }`}
        aria-hidden="true"
      >
        {complete ? <Check className="h-4 w-4" /> : number}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
          {title}
        </h3>
        {hint && (
          <p className="text-[11px] leading-tight text-muted-foreground">
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Step combinado "Datos de la cita" — consolida Paciente + Cuándo + Motivo
 * en una sola pantalla con 3 secciones organizadas. Reduce de 3 clicks a 1
 * para la mayoría de los flujos. Cada sección tiene su propio header con
 * check verde cuando está completa, y un divider sutil entre ellas.
 */
function EssentialsStepContent(props: {
  // patient
  selectedPatient: SelectedPatient | null;
  onPatientChange: (p: SelectedPatient | null) => void;
  patientComplete: boolean;
  // schedule
  date: string;
  onDateChange: (v: string) => void;
  time: string;
  onTimeChange: (v: string) => void;
  durationMin: number;
  onDurationChange: (v: number) => void;
  appointmentType: string;
  onTypeChange: (v: string) => void;
  meetingUrl: string | null;
  copiedMeeting: boolean;
  onCopyMeeting: () => void;
  findingSlot: boolean;
  onFindNextSlot: () => void;
  userId: string | null;
  validation: SlotValidationResult;
  weeklySchedule: WeeklyScheduleRow[];
  timeBlocks: TimeBlockRow[];
  dayAppointments: AppointmentRow[];
  availabilityExceptions: AvailabilityExceptionRow[];
  // details
  reason: string;
  onReasonChange: (v: string) => void;
  frequentReasons: string[];
  reasonsLoading: boolean;
  preparations: string;
  onPreparationsChange: (v: string) => void;
  frequentPreparations: string[];
}) {
  const scheduleComplete =
    !!props.date && !!props.time && !!props.durationMin &&
    !!props.appointmentType && !props.validation.hasErrors;
  const detailsComplete = props.reason.trim().length > 0;

  // Layout 2-col: Paciente + Motivo apilados a la izquierda (5/12),
  // Cuándo full-height a la derecha (7/12). Mobile: stack vertical.
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
      {/* COLUMNA IZQUIERDA: Paciente arriba + Motivo abajo */}
      <div className="space-y-4 lg:col-span-5">
        <section className="space-y-2">
          <SectionHeader
            number={1}
            icon={User}
            title="Paciente"
            hint="Buscá por cédula."
            complete={props.patientComplete}
          />
          <PatientPicker
            value={props.selectedPatient}
            onChange={props.onPatientChange}
          />
        </section>

        <section className="space-y-2">
          <SectionHeader
            number={3}
            icon={Info}
            title="Motivo de la consulta"
            hint="¿Por qué viene? Sumá preparaciones."
            complete={detailsComplete}
          />
          <DetailsStepContent
            reason={props.reason}
            onReasonChange={props.onReasonChange}
            frequentReasons={props.frequentReasons}
            reasonsLoading={props.reasonsLoading}
            preparations={props.preparations}
            onPreparationsChange={props.onPreparationsChange}
            frequentPreparations={props.frequentPreparations}
          />
        </section>
      </div>

      {/* COLUMNA DERECHA: Cuándo y de qué tipo */}
      <section className="space-y-2 lg:col-span-7">
        <SectionHeader
          number={2}
          icon={CalendarDays}
          title="Cuándo y de qué tipo"
          hint="Fecha, hora, duración y modalidad."
          complete={scheduleComplete}
        />
        <ScheduleStepContent
          date={props.date}
          onDateChange={props.onDateChange}
          time={props.time}
          onTimeChange={props.onTimeChange}
          durationMin={props.durationMin}
          onDurationChange={props.onDurationChange}
          appointmentType={props.appointmentType}
          onTypeChange={props.onTypeChange}
          meetingUrl={props.meetingUrl}
          copiedMeeting={props.copiedMeeting}
          onCopyMeeting={props.onCopyMeeting}
          findingSlot={props.findingSlot}
          onFindNextSlot={props.onFindNextSlot}
          userId={props.userId}
          validation={props.validation}
          weeklySchedule={props.weeklySchedule}
          timeBlocks={props.timeBlocks}
          dayAppointments={props.dayAppointments}
          availabilityExceptions={props.availabilityExceptions}
        />
      </section>
    </div>
  );
}

function ScheduleStepContent({
  date, onDateChange, time, onTimeChange, durationMin, onDurationChange,
  appointmentType, onTypeChange, meetingUrl, copiedMeeting, onCopyMeeting,
  findingSlot, onFindNextSlot, userId, validation,
  weeklySchedule, timeBlocks, dayAppointments, availabilityExceptions,
}: {
  date: string;
  onDateChange: (v: string) => void;
  time: string;
  onTimeChange: (v: string) => void;
  durationMin: number;
  onDurationChange: (v: number) => void;
  appointmentType: string;
  onTypeChange: (v: string) => void;
  meetingUrl: string | null;
  copiedMeeting: boolean;
  onCopyMeeting: () => void;
  findingSlot: boolean;
  onFindNextSlot: () => void;
  userId: string | null;
  validation: SlotValidationResult;
  weeklySchedule: WeeklyScheduleRow[];
  timeBlocks: TimeBlockRow[];
  dayAppointments: AppointmentRow[];
  availabilityExceptions: AvailabilityExceptionRow[];
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {[
            { label: 'Hoy', days: 0 },
            { label: 'Mañana', days: 1 },
            { label: '+1 sem.', days: 7 },
            { label: '+2 sem.', days: 14 },
          ].map((q) => {
            const target = addDaysIso(formatDateKey(new Date()), q.days);
            const active = date === target;
            return (
              <button
                key={q.label}
                type="button"
                onClick={() => onDateChange(target)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  active ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'border border-border bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {q.label}
              </button>
            );
          })}
        </div>
        <Button
          type="button" variant="ghost" size="sm" onClick={onFindNextSlot}
          disabled={findingSlot || !userId} className="h-7 px-2 text-xs"
        >
          <Sparkles className="mr-1 h-3.5 w-3.5" />
          {findingSlot ? 'Buscando…' : 'Próximo libre'}
        </Button>
      </div>

      {/* Fecha + Hora lado a lado, Duración full-width abajo con sus chips. */}
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="cita-fecha" className="text-xs">Fecha</Label>
          <DatePickerDark
            value={date}
            onChange={onDateChange}
            minDate={formatDateKey(new Date())}
            weeklySchedule={weeklySchedule}
            availabilityExceptions={availabilityExceptions}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cita-hora" className="text-xs">Hora</Label>
          <TimePickerGrid
            value={time}
            onChange={onTimeChange}
            date={date}
            durationMin={durationMin}
            weeklySchedule={weeklySchedule}
            timeBlocks={timeBlocks}
            dayAppointments={dayAppointments}
          />
        </div>
      </div>

      {/* Duración como chips — full width abajo, fluyen sin limitarse a un col. */}
      <div className="space-y-1.5">
        <Label className="text-xs">Duración</Label>
        <div role="radiogroup" aria-label="Duración" className="flex flex-wrap gap-1">
          {DURATION_OPTIONS.map((opt) => {
            const active = String(durationMin) === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onDurationChange(Number(opt.value))}
                className={`min-w-[52px] rounded-md border px-2 py-1.5 text-xs font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  active
                    ? 'border-transparent bg-primary text-primary-foreground shadow-sm ring-1 ring-inset ring-primary'
                    : 'border-border bg-card text-muted-foreground hover:border-border-strong hover:bg-muted/40 hover:text-foreground'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Tipo de cita</Label>
        <div role="radiogroup" aria-label="Tipo de cita" className="grid grid-cols-3 gap-1.5 sm:grid-cols-5">
          {APPOINTMENT_TYPES.map((t) => {
            const Icon = t.icon;
            const active = appointmentType === t.value;
            return (
              <button
                key={t.value} type="button" role="radio" aria-checked={active}
                onClick={() => onTypeChange(t.value)}
                className={`group flex flex-col items-center justify-center gap-1 rounded-lg border bg-card p-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  active
                    ? `border-transparent ${t.activeBg} ${t.activeText} shadow-sm ring-1 ring-inset ${t.activeRing}`
                    : 'border-border text-muted-foreground hover:border-border-strong hover:bg-muted/40 hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-[11px] font-medium leading-none">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {appointmentType === 'telemedicine' && meetingUrl && (
        <div className="space-y-1.5 rounded-lg border border-violet-500/30 bg-violet-500/5 p-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-300">
            <Video className="h-3.5 w-3.5" /> Sala de telemedicina
          </div>
          <div className="flex items-stretch gap-1">
            <input type="text" readOnly value={meetingUrl}
              className="flex-1 rounded-md border border-input bg-background px-2.5 py-1 text-xs text-foreground" />
            <button type="button" onClick={onCopyMeeting}
              className="inline-flex items-center gap-1 rounded-md border border-input bg-card px-2 text-xs font-medium text-foreground transition-colors hover:bg-muted">
              {copiedMeeting ? (<><Check className="h-3 w-3 text-success" />Copiado</>) : (<><Copy className="h-3 w-3" />Copiar</>)}
            </button>
          </div>
        </div>
      )}

      {/* Validación del slot — mostrada acá, NO en review.
          El doctor se entera del conflicto ANTES de avanzar 6 pasos. */}
      <ScheduleSlotValidation validation={validation} />
    </div>
  );
}

/**
 * Renderiza el estado de validación del slot actual:
 *   - hasErrors  → Alert destructive con cada error listado
 *   - hasWarnings (sin errors) → Alert warning con cada warning
 *   - ok + sin warnings → NO RENDERIZA NADA (zero noise — el silencio es ok)
 *
 * Los errors se muestran como bloqueantes: la copy es directa ("Bloqueado"),
 * y el botón Siguiente del wizard ya está disabled por `scheduleComplete`.
 * Las warnings son no-bloqueantes acá; se requiere override en review.
 */
function ScheduleSlotValidation({ validation }: { validation: SlotValidationResult }) {
  if (validation.hasErrors) {
    return (
      <div className="space-y-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-destructive">
          <AlertTriangle className="h-3.5 w-3.5" />
          No podés agendar en este slot
        </div>
        <ul className="space-y-1 text-xs text-destructive/90">
          {validation.issues
            .filter((i) => i.severity === 'error')
            .map((issue, idx) => (
              <li key={idx} className="flex flex-col gap-0.5">
                <span className="font-medium">• {issue.message}</span>
                {issue.detail && (
                  <span className="ml-2 text-[11px] text-destructive/70">{issue.detail}</span>
                )}
              </li>
            ))}
        </ul>
      </div>
    );
  }

  if (validation.hasWarnings) {
    return (
      <div className="space-y-2 rounded-lg border border-warning/40 bg-warning/5 p-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-warning">
          <AlertTriangle className="h-3.5 w-3.5" />
          Atención — el slot tiene advertencias
        </div>
        <ul className="space-y-1 text-xs text-warning/90">
          {validation.issues
            .filter((i) => i.severity === 'warning')
            .map((issue, idx) => (
              <li key={idx} className="flex flex-col gap-0.5">
                <span className="font-medium">• {issue.message}</span>
                {issue.detail && (
                  <span className="ml-2 text-[11px] text-warning/70">{issue.detail}</span>
                )}
              </li>
            ))}
        </ul>
        <p className="text-[10px] text-warning/70">
          Podés continuar — vas a tener que confirmar las advertencias en el último paso.
        </p>
      </div>
    );
  }

  // Todo OK → no renderizamos nada. El silencio es buen estado.
  return null;
}

/**
 * Step combinado "Pago y extras" — consolida 4 sub-secciones en una pantalla:
 *   1. PAGO (required, full width arriba) — método + monto
 *   2. SEGUROS (opcional)
 *   3. ARCHIVOS (opcional)
 *   4. AVISO (opcional)
 *
 * Layout:
 *   - mobile (<lg)  → stack vertical
 *   - lg+           → Pago full width arriba + grid 3-col abajo con opcionales
 *
 * Pago va arriba porque es el único required del step. Las 3 opcionales abajo
 * fluyen en grid para aprovechar el ancho horizontal.
 */
function SecondaryStepContent(props: {
  // pago (required)
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (m: PaymentMethod) => void;
  paymentAmount: number | null;
  onPaymentAmountChange: (n: number | null) => void;
  doctorSuggestedPrice: number | null;
  paymentComplete: boolean;
  // seguros (opcional)
  insurance: InsuranceEntry[];
  onInsuranceChange: (v: InsuranceEntry[]) => void;
  insuranceCount: number;
  // archivos (opcional)
  attachments: File[];
  onAttachmentsChange: (v: File[]) => void;
  attachmentsCount: number;
  // aviso (opcional)
  notifyEnabled: boolean;
  onNotifyEnabledChange: (v: boolean) => void;
  notifyChannel: 'whatsapp' | 'sms';
  onNotifyChannelChange: (c: 'whatsapp' | 'sms') => void;
  notifyAdvance: Set<string>;
  onNotifyAdvanceChange: (s: Set<string>) => void;
  hasContact: boolean;
  internalNotes: string;
  onInternalNotesChange: (v: string) => void;
}) {
  return (
    <div className="space-y-5">
      {/* SECCIÓN 1: PAGO (full width, required) */}
      <section className="space-y-2">
        <SectionHeader
          number={1}
          icon={CreditCard}
          title="Pago"
          hint="Método y monto a cobrar."
          complete={props.paymentComplete}
        />
        <PaymentField
          method={props.paymentMethod}
          onMethodChange={props.onPaymentMethodChange}
          amount={props.paymentAmount}
          onAmountChange={props.onPaymentAmountChange}
          suggestedPrice={props.doctorSuggestedPrice}
        />
      </section>

      {/* OPCIONALES: 3-col en lg+, stack en mobile */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
        {/* SECCIÓN 2: SEGUROS (opcional) */}
        <section className="space-y-2 lg:col-span-4">
          <SectionHeader
            number={2}
            icon={Shield}
            title={`Seguros${props.insuranceCount > 0 ? ` · ${props.insuranceCount}` : ''}`}
            hint="Pólizas (opcional)."
            complete={props.insuranceCount > 0}
          />
          <InsuranceField
            value={props.insurance}
            onChange={props.onInsuranceChange}
          />
        </section>

        {/* SECCIÓN 3: ARCHIVOS (opcional) */}
        <section className="space-y-2 lg:col-span-4">
          <SectionHeader
            number={3}
            icon={Paperclip}
            title={`Archivos${props.attachmentsCount > 0 ? ` · ${props.attachmentsCount}` : ''}`}
            hint="Estudios, órdenes, derivaciones (opcional)."
            complete={props.attachmentsCount > 0}
          />
          <AttachmentsField
            value={props.attachments}
            onChange={props.onAttachmentsChange}
          />
        </section>

        {/* SECCIÓN 4: AVISO (opcional) */}
        <section className="space-y-2 lg:col-span-4">
          <SectionHeader
            number={4}
            icon={Bell}
            title="Aviso al paciente"
            hint="Cuándo y cómo recordarle (opcional)."
            complete={!props.notifyEnabled || props.internalNotes.trim().length > 0}
          />
          <NotifyStepContent
            notifyEnabled={props.notifyEnabled}
            onNotifyEnabledChange={props.onNotifyEnabledChange}
            notifyChannel={props.notifyChannel}
            onNotifyChannelChange={props.onNotifyChannelChange}
            notifyAdvance={props.notifyAdvance}
            onNotifyAdvanceChange={props.onNotifyAdvanceChange}
            hasContact={props.hasContact}
            internalNotes={props.internalNotes}
            onInternalNotesChange={props.onInternalNotesChange}
          />
        </section>
      </div>
    </div>
  );
}

function DetailsStepContent({
  reason, onReasonChange, frequentReasons, reasonsLoading,
  preparations, onPreparationsChange, frequentPreparations,
}: {
  reason: string;
  onReasonChange: (v: string) => void;
  frequentReasons: string[];
  reasonsLoading: boolean;
  preparations: string;
  onPreparationsChange: (v: string) => void;
  frequentPreparations: string[];
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="cita-motivo" className="text-xs">
          Motivo de consulta <span className="text-destructive">*</span>
        </Label>
        <ReasonAutocomplete
          id="cita-motivo" value={reason} onChange={onReasonChange}
          suggestions={frequentReasons} loading={reasonsLoading}
        />
      </div>
      <PreparationChips
        value={preparations}
        onChange={onPreparationsChange}
        suggestions={frequentPreparations}
      />
    </div>
  );
}

function NotifyStepContent({
  notifyEnabled, onNotifyEnabledChange, notifyChannel, onNotifyChannelChange,
  notifyAdvance, onNotifyAdvanceChange, hasContact, internalNotes, onInternalNotesChange,
}: {
  notifyEnabled: boolean;
  onNotifyEnabledChange: (v: boolean) => void;
  notifyChannel: 'whatsapp' | 'sms';
  onNotifyChannelChange: (c: 'whatsapp' | 'sms') => void;
  notifyAdvance: Set<string>;
  onNotifyAdvanceChange: (s: Set<string>) => void;
  hasContact: boolean;
  internalNotes: string;
  onInternalNotesChange: (v: string) => void;
}) {
  const toggleAdvance = (val: string) => {
    const next = new Set(notifyAdvance);
    if (next.has(val)) next.delete(val);
    else next.add(val);
    onNotifyAdvanceChange(next);
  };

  return (
    <div className="space-y-4">
      {/* Toggle principal */}
      <button
        type="button" onClick={() => onNotifyEnabledChange(!notifyEnabled)}
        aria-pressed={notifyEnabled}
        className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all ${
          notifyEnabled
            ? 'border-primary/40 bg-primary/5 ring-1 ring-inset ring-primary/20'
            : 'border-border bg-muted/20 hover:border-border-strong'
        }`}
      >
        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-colors ${
          notifyEnabled ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground'
        }`}>
          {notifyEnabled ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">
            {notifyEnabled ? 'Avisar al paciente' : 'No enviar aviso'}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {notifyEnabled ? 'Recibirá un recordatorio por el canal elegido.' : 'Activá para enviar recordatorio automático.'}
          </p>
        </div>
        <div className={`flex h-5 w-9 items-center rounded-full transition-colors ${
          notifyEnabled ? 'justify-end bg-primary' : 'justify-start bg-muted-foreground/30'
        }`}>
          <span className="m-0.5 h-4 w-4 rounded-full bg-card shadow-sm" />
        </div>
      </button>

      {notifyEnabled && (
        <>
          {/* Canal */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Canal de aviso</p>
            <div role="radiogroup" aria-label="Canal" className="grid grid-cols-2 gap-2">
              {NOTIFY_CHANNELS.map((ch) => {
                const Icon = ch.icon;
                const active = notifyChannel === ch.value;
                const accent = ch.value === 'whatsapp'
                  ? { bg: 'bg-success/10', text: 'text-success', ring: 'ring-success' }
                  : { bg: 'bg-info/10', text: 'text-info', ring: 'ring-info' };
                return (
                  <button
                    key={ch.value} type="button" role="radio" aria-checked={active}
                    onClick={() => onNotifyChannelChange(ch.value as 'whatsapp' | 'sms')}
                    className={`group flex items-center gap-2.5 rounded-lg border bg-card p-2.5 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      active
                        ? `border-transparent ${accent.bg} ${accent.text} shadow-sm ring-1 ring-inset ${accent.ring}`
                        : 'border-border text-muted-foreground hover:border-border-strong hover:bg-muted/40 hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{ch.label}</p>
                      <p className="text-[10px] opacity-70">{ch.hint}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Anticipación */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Cuándo recordar <span className="text-muted-foreground/70">(podés elegir varios)</span>
            </p>
            <div role="group" aria-label="Anticipación" className="grid grid-cols-3 gap-1.5">
              {ADVANCE_OPTIONS.map((opt) => {
                const active = notifyAdvance.has(opt.value);
                return (
                  <button
                    key={opt.value} type="button" onClick={() => toggleAdvance(opt.value)}
                    aria-pressed={active}
                    className={`flex flex-col items-center justify-center gap-0.5 rounded-lg border bg-card p-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      active
                        ? 'border-transparent bg-primary/10 text-primary shadow-sm ring-1 ring-inset ring-primary'
                        : 'border-border text-muted-foreground hover:border-border-strong hover:bg-muted/40 hover:text-foreground'
                    }`}
                  >
                    <Clock className="h-4 w-4" />
                    <span className="text-[11px] font-semibold">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {!hasContact && (
            <p className="rounded-md border border-warning/30 bg-warning/5 px-2.5 py-1.5 text-[11px] text-warning">
              Elegí un paciente primero para validar el contacto.
            </p>
          )}

          <div className="flex items-start gap-2 rounded-md border border-dashed border-border bg-muted/20 px-2.5 py-1.5">
            <Sparkles className="mt-0.5 h-3 w-3 flex-shrink-0 text-primary" />
            <p className="text-[10px] leading-tight text-muted-foreground">
              Por ahora se programa el aviso (queda en cola). El envío
              automático real arranca en la próxima fase.
            </p>
          </div>
        </>
      )}

      {/* Notas internas */}
      <div className="space-y-1.5 border-t border-border pt-3">
        <Label htmlFor="cita-notas" className="flex items-center gap-1.5 text-xs">
          <FileText className="h-3.5 w-3.5" />
          Notas internas <span className="text-muted-foreground">(solo vos)</span>
        </Label>
        <textarea
          id="cita-notas"
          value={internalNotes}
          onChange={(e) => onInternalNotesChange(e.target.value)}
          rows={3}
          placeholder="Recordatorios privados, observaciones…"
          className={`${INPUT_BASE} min-h-20`}
        />
      </div>
    </div>
  );
}
