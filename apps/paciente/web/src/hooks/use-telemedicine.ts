"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useCallback, useRef } from "react";

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
  type ChatMessage,
} from "@/lib/services/telemedicine-service";
import { supabase } from "@/lib/supabase/client";

// Hook for telemedicine sessions list
export function useTelemedicineSessions(patientId: string | undefined) {
  const {
    data,
    isFetching,
    error,
    refetch: refresh,
  } = useQuery({
    queryKey: ["telemedicineSessions", patientId],
    queryFn: async () => {
      const [upcomingResult, historyResult] = await Promise.all([
        getUpcomingSessions(patientId!),
        getSessionHistory(patientId!),
      ]);

      if (!upcomingResult.success || !historyResult.success)
        throw new Error("Error cargando sesiones");

      return {
        upcoming: upcomingResult.data,
        history: historyResult.data,
      };
    },
    enabled: !!patientId,
  });

  return {
    upcoming: data?.upcoming ?? [],
    history: data?.history ?? [],
    loading: isFetching,
    error: error ? "Error cargando sesiones" : null,
    refresh,
  };
}

// Hook for a single telemedicine session with real-time updates
export function useTelemedicineSession(sessionId: string | undefined) {
  const queryClient = useQueryClient();

  const { data, isFetching, error } = useQuery({
    queryKey: ["telemedicineSession", sessionId],
    queryFn: async () => {
      const result = await getSessionDetail(sessionId!);
      if (!result.success || !result.data)
        throw new Error("No se pudo cargar la sesion");
      return result.data;
    },
    enabled: !!sessionId,
  });

  // Subscribe to real-time updates — stays as useEffect
  useEffect(() => {
    if (!sessionId) return;

    const unsubscribe = subscribeToSession(sessionId, (updated) => {
      queryClient.setQueryData(
        ["telemedicineSession", sessionId],
        updated
      );
    });

    return unsubscribe;
  }, [sessionId, queryClient]);

  const { mutateAsync: joinMutation } = useMutation({
    mutationFn: async () => {
      const result = await joinWaitingRoom(sessionId!);
      if (!result.success) throw new Error("Error joining waiting room");
      return result;
    },
    onSuccess: (result) => {
      if (result.data) {
        queryClient.setQueryData(
          ["telemedicineSession", sessionId],
          result.data
        );
      }
    },
  });

  const join = useCallback(async () => {
    if (!sessionId) return;
    return joinMutation();
  }, [sessionId, joinMutation]);

  return {
    session: data ?? null,
    loading: isFetching,
    error: error ? "No se pudo cargar la sesion" : null,
    join,
  };
}

// Hook for in-call chat
export function useTelemedicineChat(sessionId: string | undefined) {
  const queryClient = useQueryClient();

  const { data, isFetching } = useQuery({
    queryKey: ["telemedicineChat", sessionId],
    queryFn: async () => {
      const result = await getChatMessages(sessionId!);
      if (!result.success) throw new Error("Error loading messages");
      return result.data;
    },
    enabled: !!sessionId,
  });

  // Subscribe to new messages — stays as useEffect
  useEffect(() => {
    if (!sessionId) return;

    const unsubscribe = subscribeToChatMessages(sessionId, (newMessage) => {
      queryClient.setQueryData<ChatMessage[]>(
        ["telemedicineChat", sessionId],
        (prev) => {
          if (!prev) return [newMessage];
          if (prev.some((m) => m.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        }
      );
    });

    return unsubscribe;
  }, [sessionId, queryClient]);

  const { mutateAsync: sendMutation, isPending: sending } = useMutation({
    mutationFn: async (content: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      return await sendChatMessage(sessionId!, user.id, content);
    },
    onSuccess: (result) => {
      if (result.success && result.data) {
        queryClient.setQueryData<ChatMessage[]>(
          ["telemedicineChat", sessionId],
          (prev) => {
            if (!prev) return [result.data!];
            if (prev.some((m) => m.id === result.data!.id)) return prev;
            return [...prev, result.data!];
          }
        );
      }
    },
  });

  const send = useCallback(
    async (content: string) => {
      if (!sessionId) return;
      return sendMutation(content);
    },
    [sessionId, sendMutation]
  );

  return { messages: data ?? [], loading: isFetching, sending, send };
}

// Hook for session rating
export function useSessionRating(sessionId: string | undefined) {
  const [rated, setRated] = useState(false);

  const { mutateAsync: rateMutation, isPending } = useMutation({
    mutationFn: async ({
      rating,
      comment,
    }: {
      rating: number;
      comment?: string;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      return await rateSession(sessionId!, user.id, rating, comment);
    },
    onSuccess: (result) => {
      if (result.success) setRated(true);
    },
  });

  const rate = useCallback(
    async (rating: number, comment?: string) => {
      if (!sessionId) return;
      return rateMutation({ rating, comment });
    },
    [sessionId, rateMutation]
  );

  return { rate, loading: isPending, rated };
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
