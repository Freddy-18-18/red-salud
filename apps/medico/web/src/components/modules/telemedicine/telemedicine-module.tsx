'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  Video,
  Calendar,
  Clock,
  User,
  PhoneCall,
  History,
  X,
} from 'lucide-react';
import { cn } from '@red-salud/core/utils';
import type { ModuleComponentProps } from '../module-registry';
import { ModuleWrapper } from '../module-wrapper';
import {
  useTelemedicine,
  useTelemedicineSessions,
  type TelemedicineSession,
} from './use-telemedicine';
import { VideoRoom } from './video-room';
import { WaitingRoom } from './waiting-room';
import { ConsultationNotesPanel } from './consultation-notes-panel';

// ============================================================================
// TYPES
// ============================================================================

type ViewState = 'list' | 'waiting-room' | 'in-call';

// ============================================================================
// CONSTANTS
// ============================================================================

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  scheduled: { label: 'Programada', color: 'bg-blue-100 text-blue-700' },
  waiting: { label: 'En espera', color: 'bg-yellow-100 text-yellow-700' },
  in_progress: { label: 'En curso', color: 'bg-emerald-100 text-emerald-700' },
  completed: { label: 'Completada', color: 'bg-gray-100 text-gray-600' },
  cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-700' },
};

// ============================================================================
// SESSION CARD
// ============================================================================

function SessionCard({
  session,
  isUpcoming,
  onStart,
  themeColor,
}: {
  session: TelemedicineSession;
  isUpcoming: boolean;
  onStart: () => void;
  themeColor: string;
}) {
  const statusCfg = STATUS_CONFIG[session.status] ?? STATUS_CONFIG.scheduled;
  const scheduledDate = new Date(session.scheduled_at);
  const isToday = new Date().toDateString() === scheduledDate.toDateString();
  const isPast = scheduledDate < new Date();

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors">
      {/* Avatar */}
      <div
        className="h-10 w-10 rounded-full flex items-center justify-center shrink-0 text-white text-sm font-bold"
        style={{ backgroundColor: themeColor }}
      >
        {session.patient_name?.charAt(0)?.toUpperCase() ?? 'P'}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-700 truncate">
            {session.patient_name ?? 'Paciente'}
          </p>
          {session.patient_age && (
            <span className="text-xs text-gray-400">{session.patient_age} años</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <Calendar className="h-3 w-3 text-gray-400" />
          <span className="text-xs text-gray-500">
            {isToday
              ? `Hoy, ${scheduledDate.toLocaleTimeString('es-VE', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}`
              : scheduledDate.toLocaleDateString('es-VE', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
          </span>
          {session.reason && (
            <>
              <span className="text-gray-300">&middot;</span>
              <span className="text-xs text-gray-400 truncate">{session.reason}</span>
            </>
          )}
        </div>
      </div>

      {/* Status / action */}
      <div className="flex items-center gap-2 shrink-0">
        <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full', statusCfg.color)}>
          {statusCfg.label}
        </span>

        {isUpcoming && (session.status === 'scheduled' || session.status === 'waiting') && (
          <button
            type="button"
            onClick={onStart}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg text-white transition-colors"
            style={{ backgroundColor: themeColor }}
          >
            <PhoneCall className="h-3.5 w-3.5" />
            Iniciar
          </button>
        )}
      </div>

      {/* Duration for completed */}
      {session.status === 'completed' && session.duration_seconds != null && (
        <div className="flex items-center gap-1 text-[10px] text-gray-400 shrink-0">
          <Clock className="h-3 w-3" />
          {Math.round(session.duration_seconds / 60)} min
        </div>
      )}
    </div>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function TelemedicineModule({
  doctorId,
  patientId,
  specialtySlug,
  config,
  themeColor = '#3B82F6',
}: ModuleComponentProps) {
  // State
  const [viewState, setViewState] = useState<ViewState>('list');
  const [activeSession, setActiveSession] = useState<TelemedicineSession | null>(null);
  const [showPastSessions, setShowPastSessions] = useState(false);

  // Data — upcoming sessions
  const {
    sessions: upcomingSessions,
    loading: upcomingLoading,
    error: upcomingError,
    refresh: refreshUpcoming,
    updateSession,
  } = useTelemedicineSessions(doctorId, {
    upcoming: true,
    limit: 20,
  });

  // Data — past sessions
  const {
    sessions: pastSessions,
    loading: pastLoading,
  } = useTelemedicineSessions(doctorId, {
    status: 'completed',
    limit: 20,
  });

  // Telemedicine hook for the active call
  const telemed = useTelemedicine({
    appointmentId: activeSession?.appointment_id ?? '',
    doctorId,
  });

  // ── Handlers ─────────────────────────────────────────────────────────

  const handleStartSession = useCallback(
    (session: TelemedicineSession) => {
      setActiveSession(session);
      setViewState('waiting-room');
    },
    [],
  );

  const handleInitiateCall = useCallback(async () => {
    if (!activeSession) return;
    const ok = await telemed.initiateCall();
    if (ok) {
      setViewState('in-call');
      // Update session status
      await updateSession(activeSession.appointment_id, {
        status: 'in_progress',
        started_at: new Date().toISOString(),
      });
    }
  }, [activeSession, telemed, updateSession]);

  const handleEndCall = useCallback(async () => {
    telemed.endCall();
    telemed.stopLocalPreview();

    if (activeSession) {
      await updateSession(activeSession.appointment_id, {
        status: 'completed',
        ended_at: new Date().toISOString(),
      });
    }

    setViewState('list');
    setActiveSession(null);
    refreshUpcoming();
  }, [telemed, activeSession, updateSession, refreshUpcoming]);

  const handleBackToList = useCallback(() => {
    telemed.stopLocalPreview();
    setViewState('list');
    setActiveSession(null);
  }, [telemed]);

  // ── Waiting room view ─────────────────────────────────────────────────

  if (viewState === 'waiting-room' && activeSession) {
    return (
      <ModuleWrapper
        moduleKey="telemedicine-video"
        title="Sala de Espera — Teleconsulta"
        icon="Video"
        themeColor={themeColor}
        actions={[
          {
            label: 'Cancelar',
            onClick: handleBackToList,
            icon: X,
            variant: 'ghost',
          },
        ]}
      >
        <WaitingRoom
          localStream={telemed.localStream}
          audioDevices={telemed.audioDevices}
          videoDevices={telemed.videoDevices}
          error={telemed.error}
          session={activeSession}
          isPatientWaiting={activeSession.status === 'waiting'}
          onStartPreview={telemed.startLocalPreview}
          onRefreshDevices={telemed.refreshDevices}
          onStartCall={handleInitiateCall}
          themeColor={themeColor}
        />
      </ModuleWrapper>
    );
  }

  // ── In-call view ──────────────────────────────────────────────────────

  if (viewState === 'in-call' && activeSession) {
    return (
      <div className="space-y-4">
        <VideoRoom
          localStream={telemed.localStream}
          remoteStream={telemed.remoteStream}
          connectionState={telemed.connectionState}
          networkQuality={telemed.networkQuality}
          isMuted={telemed.isMuted}
          isCameraOff={telemed.isCameraOff}
          isScreenSharing={telemed.isScreenSharing}
          isRemoteConnected={telemed.isRemoteConnected}
          session={activeSession}
          onToggleMute={telemed.toggleMute}
          onToggleCamera={telemed.toggleCamera}
          onStartScreenShare={telemed.startScreenShare}
          onStopScreenShare={telemed.stopScreenShare}
          onEndCall={handleEndCall}
          themeColor={themeColor}
        />

        {/* Side panel with notes */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <ConsultationNotesPanel
            session={activeSession}
            startedAt={activeSession.started_at}
            themeColor={themeColor}
          />
        </div>
      </div>
    );
  }

  // ── Main list view ────────────────────────────────────────────────────

  const allSessions = showPastSessions ? [...upcomingSessions, ...pastSessions] : upcomingSessions;
  const isLoading = upcomingLoading || (showPastSessions && pastLoading);

  return (
    <ModuleWrapper
      moduleKey="telemedicine-video"
      title="Telemedicina"
      icon="Video"
      description="Consultas por videollamada"
      themeColor={themeColor}
      isEmpty={!isLoading && allSessions.length === 0}
      emptyMessage="Sin consultas de telemedicina programadas"
      isLoading={isLoading}
    >
      {/* ── Upcoming sessions ──────────────────────────────────── */}
      {upcomingSessions.length > 0 && (
        <div className="space-y-2 mb-4">
          <h4 className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
            <PhoneCall className="h-3.5 w-3.5" />
            Próximas Consultas
          </h4>
          {upcomingSessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              isUpcoming={true}
              onStart={() => handleStartSession(session)}
              themeColor={themeColor}
            />
          ))}
        </div>
      )}

      {/* ── Past sessions toggle ──────────────────────────────── */}
      <div className="border-t border-gray-100 pt-3">
        <button
          type="button"
          onClick={() => setShowPastSessions(!showPastSessions)}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
        >
          <History className="h-3.5 w-3.5" />
          {showPastSessions ? 'Ocultar historial' : 'Ver historial de consultas'}
        </button>

        {showPastSessions && pastSessions.length > 0 && (
          <div className="space-y-2 mt-3">
            {pastSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                isUpcoming={false}
                onStart={() => {}}
                themeColor={themeColor}
              />
            ))}
          </div>
        )}

        {showPastSessions && !pastLoading && pastSessions.length === 0 && (
          <p className="text-xs text-gray-400 mt-3">
            Sin consultas previas registradas
          </p>
        )}
      </div>

      {/* Error */}
      {upcomingError && (
        <div className="mt-3 p-3 rounded-lg bg-red-50 text-sm text-red-600">
          {upcomingError}
        </div>
      )}
    </ModuleWrapper>
  );
}
