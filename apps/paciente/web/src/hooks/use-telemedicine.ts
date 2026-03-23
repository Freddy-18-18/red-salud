"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  getUpcomingSessions,
  getSessionHistory,
  getSessionDetail,
  joinWaitingRoom,
  sendChatMessage,
  getChatMessages,
  rateSession,
  subscribeToSession,
  subscribeToChatMessages,
  type TelemedicineSession,
  type ChatMessage,
} from "@/lib/services/telemedicine-service";

// Hook for telemedicine sessions list
export function useTelemedicineSessions(patientId: string | undefined) {
  const [upcoming, setUpcoming] = useState<TelemedicineSession[]>([]);
  const [history, setHistory] = useState<TelemedicineSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    setError(null);

    try {
      const [upcomingResult, historyResult] = await Promise.all([
        getUpcomingSessions(patientId),
        getSessionHistory(patientId),
      ]);

      if (upcomingResult.success) setUpcoming(upcomingResult.data);
      if (historyResult.success) setHistory(historyResult.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cargando sesiones");
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    if (patientId) refresh();
  }, [patientId, refresh]);

  return { upcoming, history, loading, error, refresh };
}

// Hook for a single telemedicine session with real-time updates
export function useTelemedicineSession(sessionId: string | undefined) {
  const [session, setSession] = useState<TelemedicineSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    const loadSession = async () => {
      setLoading(true);
      const result = await getSessionDetail(sessionId);
      if (result.success && result.data) {
        setSession(result.data);
      } else {
        setError("No se pudo cargar la sesion");
      }
      setLoading(false);
    };

    loadSession();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToSession(sessionId, (updated) => {
      setSession(updated);
    });

    return unsubscribe;
  }, [sessionId]);

  const join = useCallback(async () => {
    if (!sessionId) return;
    const result = await joinWaitingRoom(sessionId);
    if (result.success && result.data) {
      setSession(result.data);
    }
    return result;
  }, [sessionId]);

  return { session, loading, error, join };
}

// Hook for in-call chat
export function useTelemedicineChat(sessionId: string | undefined) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!sessionId) return;

    const loadMessages = async () => {
      setLoading(true);
      const result = await getChatMessages(sessionId);
      if (result.success) {
        setMessages(result.data);
      }
      setLoading(false);
    };

    loadMessages();

    // Subscribe to new messages
    const unsubscribe = subscribeToChatMessages(sessionId, (newMessage) => {
      setMessages((prev) => {
        // Avoid duplicates
        if (prev.some((m) => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });
    });

    return unsubscribe;
  }, [sessionId]);

  const send = useCallback(
    async (content: string) => {
      if (!sessionId) return;
      setSending(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const result = await sendChatMessage(sessionId, user.id, content);
        if (result.success && result.data) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === result.data!.id)) return prev;
            return [...prev, result.data!];
          });
        }
        return result;
      } finally {
        setSending(false);
      }
    },
    [sessionId]
  );

  return { messages, loading, sending, send };
}

// Hook for session rating
export function useSessionRating(sessionId: string | undefined) {
  const [loading, setLoading] = useState(false);
  const [rated, setRated] = useState(false);

  const rate = useCallback(
    async (rating: number, comment?: string) => {
      if (!sessionId) return;
      setLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const result = await rateSession(sessionId, user.id, rating, comment);
        if (result.success) setRated(true);
        return result;
      } finally {
        setLoading(false);
      }
    },
    [sessionId]
  );

  return { rate, loading, rated };
}

// Hook for media device access (camera, microphone)
export function useMediaDevices() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [devices, setDevices] = useState<{
    cameras: MediaDeviceInfo[];
    microphones: MediaDeviceInfo[];
    speakers: MediaDeviceInfo[];
  }>({ cameras: [], microphones: [], speakers: [] });

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);

  const requestAccess = useCallback(async () => {
    try {
      setPermissionError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(mediaStream);

      // Enumerate devices after permission granted
      const deviceList = await navigator.mediaDevices.enumerateDevices();
      setDevices({
        cameras: deviceList.filter((d) => d.kind === "videoinput"),
        microphones: deviceList.filter((d) => d.kind === "audioinput"),
        speakers: deviceList.filter((d) => d.kind === "audiooutput"),
      });

      // Setup audio analysis for mic level
      const audioCtx = new AudioContext();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      const source = audioCtx.createMediaStreamSource(mediaStream);
      source.connect(analyser);
      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      const updateLevel = () => {
        if (!analyserRef.current) return;
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        const average =
          dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length;
        setAudioLevel(average / 255);
        animFrameRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();

      return { success: true };
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "Necesitas permitir el acceso a la camara y microfono para la consulta virtual"
          : "Error al acceder a los dispositivos. Verifica que tu camara y microfono estan conectados.";
      setPermissionError(message);
      return { success: false, error: message };
    }
  }, []);

  const toggleCamera = useCallback(() => {
    if (!stream) return;
    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setCameraEnabled(videoTrack.enabled);
    }
  }, [stream]);

  const toggleMic = useCallback(() => {
    if (!stream) return;
    const audioTrack = stream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setMicEnabled(audioTrack.enabled);
    }
  }, [stream]);

  const stopAll = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
  }, [stream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    stream,
    audioLevel,
    cameraEnabled,
    micEnabled,
    permissionError,
    devices,
    requestAccess,
    toggleCamera,
    toggleMic,
    stopAll,
  };
}

// Hook for call duration timer
export function useCallTimer(startedAt: string | undefined) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startedAt) return;

    const startTime = new Date(startedAt).getTime();

    const update = () => {
      const diff = Math.floor((Date.now() - startTime) / 1000);
      setElapsed(diff);
    };

    update();
    const interval = setInterval(update, 1000);

    return () => clearInterval(interval);
  }, [startedAt]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return { elapsed, formatted: formatTime(elapsed) };
}
