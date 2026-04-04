'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';

// ============================================================================
// TYPES
// ============================================================================

export type ConnectionState =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'ended'
  | 'failed';

export type NetworkQuality = 'good' | 'fair' | 'poor' | 'unknown';

export interface TelemedicineSession {
  id: string;
  appointment_id: string;
  doctor_id: string;
  patient_id: string;
  patient_name?: string;
  patient_age?: number;
  reason?: string;
  status: 'scheduled' | 'waiting' | 'in_progress' | 'completed' | 'cancelled';
  meeting_url: string | null;
  started_at: string | null;
  ended_at: string | null;
  duration_seconds: number | null;
  notes: string | null;
  scheduled_at: string;
  created_at: string;
}

export interface DeviceInfo {
  deviceId: string;
  label: string;
  kind: MediaDeviceKind;
}

interface SignalMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'hangup';
  payload: any;
  sender: string;
}

interface UseTelemedicineOptions {
  appointmentId: string;
  doctorId: string;
  onRemoteStream?: (stream: MediaStream) => void;
  onConnectionStateChange?: (state: ConnectionState) => void;
}

interface UseTelemedicineReturn {
  // Streams
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;

  // State
  connectionState: ConnectionState;
  networkQuality: NetworkQuality;
  isMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing: boolean;
  isRemoteConnected: boolean;
  error: string | null;

  // Actions
  startLocalPreview: (audioDeviceId?: string, videoDeviceId?: string) => Promise<boolean>;
  stopLocalPreview: () => void;
  initiateCall: () => Promise<boolean>;
  endCall: () => void;
  toggleMute: () => void;
  toggleCamera: () => void;
  startScreenShare: () => Promise<boolean>;
  stopScreenShare: () => void;

  // Devices
  audioDevices: DeviceInfo[];
  videoDevices: DeviceInfo[];
  refreshDevices: () => Promise<void>;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

const NETWORK_QUALITY_THRESHOLDS = {
  good: { rtt: 150, packetLoss: 0.02 },
  fair: { rtt: 300, packetLoss: 0.05 },
} as const;

// ============================================================================
// HOOK
// ============================================================================

export function useTelemedicine({
  appointmentId,
  doctorId,
  onRemoteStream,
  onConnectionStateChange,
}: UseTelemedicineOptions): UseTelemedicineReturn {
  // Refs for mutable state that shouldn't trigger re-renders
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const statsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const iceCandidateBuffer = useRef<RTCIceCandidateInit[]>([]);

  // State
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle');
  const [networkQuality, setNetworkQuality] = useState<NetworkQuality>('unknown');
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRemoteConnected, setIsRemoteConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioDevices, setAudioDevices] = useState<DeviceInfo[]>([]);
  const [videoDevices, setVideoDevices] = useState<DeviceInfo[]>([]);

  // ── Device enumeration ──────────────────────────────────────────────────

  const refreshDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      setAudioDevices(
        devices
          .filter((d) => d.kind === 'audioinput')
          .map((d) => ({ deviceId: d.deviceId, label: d.label || `Micrófono ${d.deviceId.slice(0, 5)}`, kind: d.kind })),
      );
      setVideoDevices(
        devices
          .filter((d) => d.kind === 'videoinput')
          .map((d) => ({ deviceId: d.deviceId, label: d.label || `Cámara ${d.deviceId.slice(0, 5)}`, kind: d.kind })),
      );
    } catch {
      // Silently fail — devices will show empty
    }
  }, []);

  // ── Local preview ───────────────────────────────────────────────────────

  const startLocalPreview = useCallback(
    async (audioDeviceId?: string, videoDeviceId?: string): Promise<boolean> => {
      try {
        // Check WebRTC support
        if (!navigator.mediaDevices?.getUserMedia) {
          setError('Tu navegador no soporta videollamadas. Usa Chrome, Firefox o Edge.');
          return false;
        }

        const constraints: MediaStreamConstraints = {
          audio: audioDeviceId ? { deviceId: { exact: audioDeviceId } } : true,
          video: videoDeviceId
            ? { deviceId: { exact: videoDeviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }
            : { width: { ideal: 1280 }, height: { ideal: 720 } },
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        localStreamRef.current = stream;
        setLocalStream(stream);
        setError(null);

        // Refresh devices after permission granted (labels become available)
        await refreshDevices();

        return true;
      } catch (err: any) {
        if (err.name === 'NotAllowedError') {
          setError('Permisos de cámara/micrófono denegados. Verifica la configuración del navegador.');
        } else if (err.name === 'NotFoundError') {
          setError('No se encontraron dispositivos de cámara o micrófono.');
        } else if (err.name === 'NotReadableError') {
          setError('La cámara o micrófono están siendo usados por otra aplicación.');
        } else {
          setError(`Error al acceder a los dispositivos: ${err.message}`);
        }
        return false;
      }
    },
    [refreshDevices],
  );

  const stopLocalPreview = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }
  }, []);

  // ── Network quality monitoring ──────────────────────────────────────────

  const startStatsMonitoring = useCallback(() => {
    if (statsIntervalRef.current) clearInterval(statsIntervalRef.current);

    statsIntervalRef.current = setInterval(async () => {
      const pc = peerConnectionRef.current;
      if (!pc || pc.connectionState !== 'connected') return;

      try {
        const stats = await pc.getStats();
        let rtt = 0;
        let packetLoss = 0;

        stats.forEach((report) => {
          if (report.type === 'candidate-pair' && report.state === 'succeeded') {
            rtt = report.currentRoundTripTime ? report.currentRoundTripTime * 1000 : 0;
          }
          if (report.type === 'inbound-rtp' && report.kind === 'video') {
            const lost = report.packetsLost ?? 0;
            const received = report.packetsReceived ?? 1;
            packetLoss = lost / (lost + received);
          }
        });

        if (rtt <= NETWORK_QUALITY_THRESHOLDS.good.rtt && packetLoss <= NETWORK_QUALITY_THRESHOLDS.good.packetLoss) {
          setNetworkQuality('good');
        } else if (rtt <= NETWORK_QUALITY_THRESHOLDS.fair.rtt && packetLoss <= NETWORK_QUALITY_THRESHOLDS.fair.packetLoss) {
          setNetworkQuality('fair');
        } else {
          setNetworkQuality('poor');
        }
      } catch {
        // Stats collection failed — not critical
      }
    }, 3000);
  }, []);

  const stopStatsMonitoring = useCallback(() => {
    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
      statsIntervalRef.current = null;
    }
  }, []);

  // ── Signaling via Supabase Realtime ─────────────────────────────────────

  const sendSignal = useCallback(
    (message: SignalMessage) => {
      const channel = channelRef.current;
      if (!channel) return;

      channel.send({
        type: 'broadcast',
        event: 'signal',
        payload: message,
      });
    },
    [],
  );

  // ── WebRTC peer connection ──────────────────────────────────────────────

  const createPeerConnection = useCallback((): RTCPeerConnection => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    // Send ICE candidates to remote
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal({
          type: 'ice-candidate',
          payload: event.candidate.toJSON(),
          sender: doctorId,
        });
      }
    };

    // Handle remote stream
    pc.ontrack = (event) => {
      const [stream] = event.streams;
      if (stream) {
        setRemoteStream(stream);
        setIsRemoteConnected(true);
        onRemoteStream?.(stream);
      }
    };

    // Connection state changes
    pc.onconnectionstatechange = () => {
      switch (pc.connectionState) {
        case 'connecting':
          setConnectionState('connecting');
          break;
        case 'connected':
          setConnectionState('connected');
          startStatsMonitoring();
          break;
        case 'disconnected':
          setConnectionState('reconnecting');
          break;
        case 'failed':
          setConnectionState('failed');
          setError('La conexión falló. Intente reconectarse.');
          stopStatsMonitoring();
          break;
        case 'closed':
          setConnectionState('ended');
          stopStatsMonitoring();
          break;
      }
      onConnectionStateChange?.(connectionState);
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'disconnected') {
        setConnectionState('reconnecting');
      }
    };

    return pc;
  }, [doctorId, sendSignal, startStatsMonitoring, stopStatsMonitoring, connectionState, onRemoteStream, onConnectionStateChange]);

  // ── Handle incoming signals ─────────────────────────────────────────────

  const handleSignal = useCallback(
    async (message: SignalMessage) => {
      // Ignore own messages
      if (message.sender === doctorId) return;

      const pc = peerConnectionRef.current;
      if (!pc && message.type !== 'offer') return;

      try {
        switch (message.type) {
          case 'offer': {
            // Create peer connection if it doesn't exist (callee side)
            let conn = peerConnectionRef.current;
            if (!conn) {
              conn = createPeerConnection();
              peerConnectionRef.current = conn;

              // Add local tracks
              if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach((track) => {
                  conn!.addTrack(track, localStreamRef.current!);
                });
              }
            }

            await conn.setRemoteDescription(new RTCSessionDescription(message.payload));

            // Flush buffered ICE candidates
            for (const candidate of iceCandidateBuffer.current) {
              await conn.addIceCandidate(new RTCIceCandidate(candidate));
            }
            iceCandidateBuffer.current = [];

            const answer = await conn.createAnswer();
            await conn.setLocalDescription(answer);

            sendSignal({
              type: 'answer',
              payload: answer,
              sender: doctorId,
            });
            break;
          }

          case 'answer': {
            if (pc) {
              await pc.setRemoteDescription(new RTCSessionDescription(message.payload));

              // Flush buffered ICE candidates
              for (const candidate of iceCandidateBuffer.current) {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
              }
              iceCandidateBuffer.current = [];
            }
            break;
          }

          case 'ice-candidate': {
            if (pc?.remoteDescription) {
              await pc.addIceCandidate(new RTCIceCandidate(message.payload));
            } else {
              // Buffer until remote description is set
              iceCandidateBuffer.current.push(message.payload);
            }
            break;
          }

          case 'hangup': {
            setConnectionState('ended');
            setIsRemoteConnected(false);
            peerConnectionRef.current?.close();
            peerConnectionRef.current = null;
            break;
          }
        }
      } catch (err: any) {
        console.error('[Telemedicine] Signal handling error:', err);
        setError(`Error de señalización: ${err.message}`);
      }
    },
    [doctorId, createPeerConnection, sendSignal],
  );

  // ── Initiate call (doctor is the caller/offerer) ────────────────────────

  const initiateCall = useCallback(async (): Promise<boolean> => {
    try {
      if (!localStreamRef.current) {
        setError('Inicia la vista previa de cámara primero.');
        return false;
      }

      setConnectionState('connecting');
      setError(null);

      // Create peer connection
      const pc = createPeerConnection();
      peerConnectionRef.current = pc;

      // Add local tracks
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });

      // Subscribe to signaling channel
      const channel = supabase.channel(`telemedicine:${appointmentId}`, {
        config: { broadcast: { self: false } },
      });

      channel.on('broadcast', { event: 'signal' }, ({ payload }) => {
        handleSignal(payload as SignalMessage);
      });

      await channel.subscribe();
      channelRef.current = channel;

      // Create and send offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      sendSignal({
        type: 'offer',
        payload: offer,
        sender: doctorId,
      });

      // Update appointment with meeting_url
      await supabase
        .from('appointments')
        .update({ meeting_url: `telemedicine:${appointmentId}` })
        .eq('id', appointmentId);

      return true;
    } catch (err: any) {
      setError(`Error al iniciar la llamada: ${err.message}`);
      setConnectionState('failed');
      return false;
    }
  }, [appointmentId, doctorId, createPeerConnection, handleSignal, sendSignal]);

  // ── End call ────────────────────────────────────────────────────────────

  const endCall = useCallback(() => {
    // Signal hangup to remote
    sendSignal({
      type: 'hangup',
      payload: null,
      sender: doctorId,
    });

    // Stop screen sharing if active
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
      setIsScreenSharing(false);
    }

    // Close peer connection
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;

    // Unsubscribe from channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Stop stats monitoring
    stopStatsMonitoring();

    // Update state
    setConnectionState('ended');
    setRemoteStream(null);
    setIsRemoteConnected(false);
    setNetworkQuality('unknown');
  }, [doctorId, sendSignal, stopStatsMonitoring]);

  // ── Toggle mute ─────────────────────────────────────────────────────────

  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted((prev) => !prev);
    }
  }, []);

  // ── Toggle camera ───────────────────────────────────────────────────────

  const toggleCamera = useCallback(() => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsCameraOff((prev) => !prev);
    }
  }, []);

  // ── Screen sharing ──────────────────────────────────────────────────────

  const startScreenShare = useCallback(async (): Promise<boolean> => {
    try {
      if (!navigator.mediaDevices?.getDisplayMedia) {
        setError('Tu navegador no soporta compartir pantalla.');
        return false;
      }

      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      screenStreamRef.current = screenStream;

      // Replace video track in peer connection
      const pc = peerConnectionRef.current;
      if (pc) {
        const videoSender = pc.getSenders().find((s) => s.track?.kind === 'video');
        const screenTrack = screenStream.getVideoTracks()[0];

        if (videoSender && screenTrack) {
          await videoSender.replaceTrack(screenTrack);
        }

        // When user stops sharing via browser UI
        screenTrack.onended = () => {
          stopScreenShare();
        };
      }

      setIsScreenSharing(true);
      return true;
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(`Error al compartir pantalla: ${err.message}`);
      }
      return false;
    }
  }, []);

  const stopScreenShare = useCallback(() => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
    }

    // Restore camera track
    const pc = peerConnectionRef.current;
    if (pc && localStreamRef.current) {
      const videoSender = pc.getSenders().find((s) => s.track?.kind === 'video');
      const cameraTrack = localStreamRef.current.getVideoTracks()[0];

      if (videoSender && cameraTrack) {
        videoSender.replaceTrack(cameraTrack);
      }
    }

    setIsScreenSharing(false);
  }, []);

  // ── Cleanup on unmount ──────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      // Stop local stream
      localStreamRef.current?.getTracks().forEach((track) => track.stop());

      // Stop screen stream
      screenStreamRef.current?.getTracks().forEach((track) => track.stop());

      // Close peer connection
      peerConnectionRef.current?.close();

      // Remove channel
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }

      // Stop stats monitoring
      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current);
      }
    };
  }, []);

  return {
    localStream,
    remoteStream,
    connectionState,
    networkQuality,
    isMuted,
    isCameraOff,
    isScreenSharing,
    isRemoteConnected,
    error,
    startLocalPreview,
    stopLocalPreview,
    initiateCall,
    endCall,
    toggleMute,
    toggleCamera,
    startScreenShare,
    stopScreenShare,
    audioDevices,
    videoDevices,
    refreshDevices,
  };
}

// ============================================================================
// SESSION DATA HOOK — Fetches telemedicine appointments
// ============================================================================

interface UseTelemedicineSessionsOptions {
  status?: TelemedicineSession['status'];
  upcoming?: boolean;
  limit?: number;
}

interface UseTelemedicineSessionsReturn {
  sessions: TelemedicineSession[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  updateSession: (appointmentId: string, data: Record<string, unknown>) => Promise<boolean>;
}

export function useTelemedicineSessions(
  doctorId: string,
  options?: UseTelemedicineSessionsOptions,
): UseTelemedicineSessionsReturn {
  const [sessions, setSessions] = useState<TelemedicineSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!doctorId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    async function fetchSessions() {
      let query = supabase
        .from('appointments')
        .select('*, profiles!appointments_patient_id_fkey(full_name, date_of_birth)')
        .eq('doctor_id', doctorId)
        .eq('appointment_type', 'telemedicine')
        .order('scheduled_at', { ascending: true });

      if (options?.status) {
        query = query.eq('status', options.status);
      }

      if (options?.upcoming) {
        query = query.gte('scheduled_at', new Date().toISOString());
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error: fetchError } = await query;

      if (cancelled) return;

      if (fetchError) {
        if (fetchError.code === '42P01' || fetchError.message?.includes('does not exist')) {
          setSessions([]);
          setLoading(false);
          return;
        }
        setError(fetchError.message);
        setSessions([]);
      } else {
        const mapped: TelemedicineSession[] = (data ?? []).map((row: any) => {
          const dob = row.profiles?.date_of_birth;
          let age: number | undefined;
          if (dob) {
            const diff = Date.now() - new Date(dob).getTime();
            age = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
          }

          return {
            id: row.id,
            appointment_id: row.id,
            doctor_id: row.doctor_id,
            patient_id: row.patient_id,
            patient_name: row.profiles?.full_name ?? 'Paciente',
            patient_age: age,
            reason: row.reason ?? row.notes ?? undefined,
            status: row.status ?? 'scheduled',
            meeting_url: row.meeting_url ?? null,
            started_at: row.started_at ?? null,
            ended_at: row.ended_at ?? null,
            duration_seconds: row.duration_seconds ?? null,
            notes: row.notes ?? null,
            scheduled_at: row.scheduled_at ?? row.created_at,
            created_at: row.created_at,
          };
        });
        setSessions(mapped);
      }
      setLoading(false);
    }

    fetchSessions();
    return () => { cancelled = true; };
  }, [doctorId, options?.status, options?.upcoming, options?.limit, refreshKey]);

  const updateSession = useCallback(
    async (appointmentId: string, data: Record<string, unknown>): Promise<boolean> => {
      const { error: updateError } = await supabase
        .from('appointments')
        .update(data)
        .eq('id', appointmentId)
        .eq('doctor_id', doctorId);

      if (updateError) {
        setError(updateError.message);
        return false;
      }

      refresh();
      return true;
    },
    [doctorId, refresh],
  );

  return { sessions, loading, error, refresh, updateSession };
}
