'use client';

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MonitorOff,
  PhoneOff,
  Maximize,
  Minimize,
  Wifi,
  WifiOff,
  User,
} from 'lucide-react';
import { cn } from '@red-salud/core/utils';
import type {
  ConnectionState,
  NetworkQuality,
  TelemedicineSession,
} from './use-telemedicine';

// ============================================================================
// TYPES
// ============================================================================

interface VideoRoomProps {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  connectionState: ConnectionState;
  networkQuality: NetworkQuality;
  isMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing: boolean;
  isRemoteConnected: boolean;
  session: TelemedicineSession;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onStartScreenShare: () => void;
  onStopScreenShare: () => void;
  onEndCall: () => void;
  themeColor?: string;
}

// ============================================================================
// NETWORK QUALITY INDICATOR
// ============================================================================

const QUALITY_CONFIG: Record<NetworkQuality, { label: string; color: string; bars: number }> = {
  good: { label: 'Buena', color: '#22C55E', bars: 3 },
  fair: { label: 'Regular', color: '#EAB308', bars: 2 },
  poor: { label: 'Mala', color: '#EF4444', bars: 1 },
  unknown: { label: 'Conectando...', color: '#6B7280', bars: 0 },
};

function NetworkQualityIndicator({ quality }: { quality: NetworkQuality }) {
  const cfg = QUALITY_CONFIG[quality];
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-end gap-0.5 h-3">
        {[1, 2, 3].map((bar) => (
          <div
            key={bar}
            className="w-1 rounded-full transition-colors"
            style={{
              height: `${(bar / 3) * 12}px`,
              backgroundColor: bar <= cfg.bars ? cfg.color : '#D1D5DB',
            }}
          />
        ))}
      </div>
      <span className="text-[10px] font-medium" style={{ color: cfg.color }}>
        {cfg.label}
      </span>
    </div>
  );
}

// ============================================================================
// DURATION TIMER
// ============================================================================

function DurationTimer({ startedAt }: { startedAt: string | null }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startedAt) return;

    const start = new Date(startedAt).getTime();
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAt]);

  const hours = Math.floor(elapsed / 3600);
  const minutes = Math.floor((elapsed % 3600) / 60);
  const seconds = elapsed % 60;

  const formatted = hours > 0
    ? `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <span className="text-xs font-mono text-white/80">{formatted}</span>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

export function VideoRoom({
  localStream,
  remoteStream,
  connectionState,
  networkQuality,
  isMuted,
  isCameraOff,
  isScreenSharing,
  isRemoteConnected,
  session,
  onToggleMute,
  onToggleCamera,
  onStartScreenShare,
  onStopScreenShare,
  onEndCall,
  themeColor = '#3B82F6',
}: VideoRoomProps) {
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Attach remote stream to video element
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Attach local stream to PiP video element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  }, []);

  // Listen for fullscreen change
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const isCallActive = connectionState === 'connected' || connectionState === 'reconnecting';

  return (
    <div
      ref={containerRef}
      className="relative bg-gray-900 rounded-xl overflow-hidden"
      style={{ minHeight: 400 }}
    >
      {/* ── Patient info header ──────────────────────────────────── */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-2.5">
          <div
            className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ backgroundColor: themeColor }}
          >
            {session.patient_name?.charAt(0)?.toUpperCase() ?? 'P'}
          </div>
          <div>
            <p className="text-sm font-medium text-white">
              {session.patient_name ?? 'Paciente'}
            </p>
            <div className="flex items-center gap-2">
              {session.patient_age && (
                <span className="text-[10px] text-white/60">
                  {session.patient_age} años
                </span>
              )}
              <DurationTimer startedAt={session.started_at} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <NetworkQualityIndicator quality={networkQuality} />
          <button
            type="button"
            onClick={toggleFullscreen}
            className="h-7 w-7 flex items-center justify-center rounded text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            {isFullscreen ? (
              <Minimize className="h-4 w-4" />
            ) : (
              <Maximize className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* ── Remote video (large) ─────────────────────────────────── */}
      <div className="relative w-full h-full min-h-[400px] flex items-center justify-center">
        {remoteStream && isRemoteConnected ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="h-20 w-20 rounded-full bg-gray-700 flex items-center justify-center">
              <User className="h-10 w-10 text-gray-500" />
            </div>
            <p className="text-sm text-gray-400">
              {connectionState === 'connecting'
                ? 'Conectando con el paciente...'
                : connectionState === 'reconnecting'
                  ? 'Reconectando...'
                  : connectionState === 'ended'
                    ? 'Consulta finalizada'
                    : connectionState === 'failed'
                      ? 'Error de conexión'
                      : 'Esperando al paciente...'}
            </p>
            {connectionState === 'connecting' && (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            )}
          </div>
        )}
      </div>

      {/* ── Self-view (PiP) ──────────────────────────────────────── */}
      <div className="absolute bottom-20 right-4 z-10 w-40 h-28 rounded-lg overflow-hidden shadow-lg border-2 border-gray-700">
        {localStream && !isCameraOff ? (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover mirror"
            style={{ transform: 'scaleX(-1)' }}
          />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <VideoOff className="h-6 w-6 text-gray-500" />
          </div>
        )}
        {isMuted && (
          <div className="absolute top-1 left-1 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center">
            <MicOff className="h-3 w-3 text-white" />
          </div>
        )}
      </div>

      {/* ── Controls bar ─────────────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-center gap-3 px-4 py-4 bg-gradient-to-t from-black/60 to-transparent">
        {/* Mute */}
        <button
          type="button"
          onClick={onToggleMute}
          className={cn(
            'h-12 w-12 rounded-full flex items-center justify-center transition-colors',
            isMuted
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-white/15 text-white hover:bg-white/25',
          )}
          title={isMuted ? 'Activar micrófono' : 'Silenciar micrófono'}
        >
          {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </button>

        {/* Camera */}
        <button
          type="button"
          onClick={onToggleCamera}
          className={cn(
            'h-12 w-12 rounded-full flex items-center justify-center transition-colors',
            isCameraOff
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-white/15 text-white hover:bg-white/25',
          )}
          title={isCameraOff ? 'Activar cámara' : 'Apagar cámara'}
        >
          {isCameraOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
        </button>

        {/* Screen share */}
        <button
          type="button"
          onClick={isScreenSharing ? onStopScreenShare : onStartScreenShare}
          className={cn(
            'h-12 w-12 rounded-full flex items-center justify-center transition-colors',
            isScreenSharing
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-white/15 text-white hover:bg-white/25',
          )}
          title={isScreenSharing ? 'Dejar de compartir pantalla' : 'Compartir pantalla'}
        >
          {isScreenSharing ? (
            <MonitorOff className="h-5 w-5" />
          ) : (
            <Monitor className="h-5 w-5" />
          )}
        </button>

        {/* End call */}
        <button
          type="button"
          onClick={onEndCall}
          className="h-12 w-14 rounded-full bg-red-600 text-white hover:bg-red-700 flex items-center justify-center transition-colors"
          title="Finalizar consulta"
        >
          <PhoneOff className="h-5 w-5" />
        </button>
      </div>

      {/* ── Reconnecting overlay ─────────────────────────────────── */}
      {connectionState === 'reconnecting' && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40">
          <div className="bg-gray-800 rounded-lg px-6 py-4 flex items-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            <p className="text-sm text-white">Reconectando...</p>
          </div>
        </div>
      )}
    </div>
  );
}
