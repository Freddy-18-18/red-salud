'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Wifi,
  WifiOff,
  CheckCircle2,
  XCircle,
  RefreshCw,
  AlertCircle,
  User,
} from 'lucide-react';
import { Button } from '@red-salud/design-system';
import { cn } from '@red-salud/core/utils';
import type { DeviceInfo, TelemedicineSession } from './use-telemedicine';

// ============================================================================
// TYPES
// ============================================================================

interface WaitingRoomProps {
  localStream: MediaStream | null;
  audioDevices: DeviceInfo[];
  videoDevices: DeviceInfo[];
  error: string | null;
  session: TelemedicineSession;
  isPatientWaiting: boolean;
  onStartPreview: (audioDeviceId?: string, videoDeviceId?: string) => Promise<boolean>;
  onRefreshDevices: () => Promise<void>;
  onStartCall: () => void;
  themeColor?: string;
}

// ============================================================================
// NETWORK TEST
// ============================================================================

type NetworkTestState = 'idle' | 'testing' | 'pass' | 'fail';

function useNetworkTest() {
  const [state, setState] = useState<NetworkTestState>('idle');
  const [latency, setLatency] = useState<number | null>(null);

  const runTest = useCallback(async () => {
    setState('testing');
    try {
      const start = performance.now();
      // Simple latency test via fetch to a lightweight endpoint
      await fetch('https://www.google.com/generate_204', { mode: 'no-cors' });
      const ms = Math.round(performance.now() - start);
      setLatency(ms);
      setState(ms < 500 ? 'pass' : 'fail');
    } catch {
      setLatency(null);
      setState('fail');
    }
  }, []);

  return { state, latency, runTest };
}

// ============================================================================
// COMPONENT
// ============================================================================

export function WaitingRoom({
  localStream,
  audioDevices,
  videoDevices,
  error,
  session,
  isPatientWaiting,
  onStartPreview,
  onRefreshDevices,
  onStartCall,
  themeColor = '#3B82F6',
}: WaitingRoomProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [selectedAudio, setSelectedAudio] = useState('');
  const [selectedVideo, setSelectedVideo] = useState('');
  const [previewStarted, setPreviewStarted] = useState(false);
  const networkTest = useNetworkTest();

  // Attach local stream to video preview
  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Auto-start preview on mount
  useEffect(() => {
    if (!previewStarted) {
      onStartPreview().then((ok) => {
        if (ok) setPreviewStarted(true);
      });
    }
  }, [onStartPreview, previewStarted]);

  // Run network test on mount
  useEffect(() => {
    networkTest.runTest();
  }, [networkTest.runTest]);

  // Handle device change
  const handleDeviceChange = useCallback(
    async (type: 'audio' | 'video', deviceId: string) => {
      if (type === 'audio') {
        setSelectedAudio(deviceId);
        await onStartPreview(deviceId, selectedVideo || undefined);
      } else {
        setSelectedVideo(deviceId);
        await onStartPreview(selectedAudio || undefined, deviceId);
      }
    },
    [onStartPreview, selectedAudio, selectedVideo],
  );

  const hasStream = localStream !== null;
  const canStart = hasStream && (networkTest.state === 'pass' || networkTest.state === 'idle');

  const selectClass =
    'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

  return (
    <div className="space-y-5">
      {/* ── Header ───────────────────────────────────────────────── */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700">
          Sala de Espera
        </h4>
        <p className="text-xs text-gray-400 mt-0.5">
          Verifica tu cámara y micrófono antes de iniciar la consulta
        </p>
      </div>

      {/* ── Patient connection status ────────────────────────────── */}
      <div
        className={cn(
          'flex items-center gap-2.5 p-3 rounded-lg border',
          isPatientWaiting
            ? 'bg-emerald-50 border-emerald-200'
            : 'bg-gray-50 border-gray-100',
        )}
      >
        <div
          className={cn(
            'h-8 w-8 rounded-full flex items-center justify-center shrink-0',
            isPatientWaiting ? 'bg-emerald-100' : 'bg-gray-200',
          )}
        >
          <User
            className={cn(
              'h-4 w-4',
              isPatientWaiting ? 'text-emerald-600' : 'text-gray-400',
            )}
          />
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-700">
            {session.patient_name ?? 'Paciente'}
          </p>
          <p
            className={cn(
              'text-[10px] font-medium',
              isPatientWaiting ? 'text-emerald-600' : 'text-gray-400',
            )}
          >
            {isPatientWaiting ? 'Conectado y esperando' : 'Aún no se ha conectado'}
          </p>
        </div>
        <div
          className={cn(
            'h-2.5 w-2.5 rounded-full',
            isPatientWaiting ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300',
          )}
        />
      </div>

      {/* ── Camera preview ───────────────────────────────────────── */}
      <div className="relative rounded-xl overflow-hidden bg-gray-900" style={{ minHeight: 240 }}>
        {localStream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-60 object-cover"
            style={{ transform: 'scaleX(-1)' }}
          />
        ) : (
          <div className="w-full h-60 flex flex-col items-center justify-center gap-2">
            <VideoOff className="h-10 w-10 text-gray-600" />
            <p className="text-sm text-gray-500">
              {error ?? 'Cámara no disponible'}
            </p>
          </div>
        )}
      </div>

      {/* ── Device selectors ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Audio device */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600 flex items-center gap-1.5">
            <Mic className="h-3.5 w-3.5" />
            Micrófono
          </label>
          <select
            value={selectedAudio}
            onChange={(e) => handleDeviceChange('audio', e.target.value)}
            className={selectClass}
          >
            <option value="">Predeterminado</option>
            {audioDevices.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        {/* Video device */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600 flex items-center gap-1.5">
            <Video className="h-3.5 w-3.5" />
            Cámara
          </label>
          <select
            value={selectedVideo}
            onChange={(e) => handleDeviceChange('video', e.target.value)}
            className={selectClass}
          >
            <option value="">Predeterminada</option>
            {videoDevices.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Network test ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
        <div className="flex items-center gap-2">
          {networkTest.state === 'testing' ? (
            <RefreshCw className="h-4 w-4 text-gray-400 animate-spin" />
          ) : networkTest.state === 'pass' ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          ) : networkTest.state === 'fail' ? (
            <XCircle className="h-4 w-4 text-red-500" />
          ) : (
            <Wifi className="h-4 w-4 text-gray-400" />
          )}
          <div>
            <p className="text-xs font-medium text-gray-700">
              {networkTest.state === 'testing'
                ? 'Verificando red...'
                : networkTest.state === 'pass'
                  ? 'Red estable'
                  : networkTest.state === 'fail'
                    ? 'Conexión lenta o inestable'
                    : 'Verificar conexión'}
            </p>
            {networkTest.latency != null && (
              <p className="text-[10px] text-gray-400">
                Latencia: {networkTest.latency} ms
              </p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={networkTest.runTest}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          disabled={networkTest.state === 'testing'}
        >
          Probar de nuevo
        </button>
      </div>

      {/* ── Error ────────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      {/* ── Start button ─────────────────────────────────────────── */}
      <Button
        type="button"
        onClick={onStartCall}
        disabled={!canStart}
        className="w-full h-11 text-sm font-medium"
        style={{ backgroundColor: canStart ? themeColor : undefined }}
      >
        <Video className="mr-2 h-4 w-4" />
        Iniciar Consulta
      </Button>
    </div>
  );
}
