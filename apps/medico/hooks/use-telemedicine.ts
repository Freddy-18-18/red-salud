import { useState, useEffect, useCallback } from "react";
import {
  getPatientSessions,
  getDoctorSessions,
  getSession,
  createTelemedicineSession,
  startSession,
  endSession,
  updateSession,
  joinSession,
  leaveSession,
  getSessionParticipants,
  sendMessage,
  getSessionMessages,
  markMessagesAsRead,
  createPrescription,
  getPatientPrescriptions,
  enterWaitingRoom,
  getWaitingRoomPatients,
  admitPatient,
  getPatientSessionStats,
} from "@/lib/supabase/services/telemedicine-service";
import type {
  TelemedicineSession,
  TelemedicineParticipant,
  TelemedicineChatMessage,
  TelemedicinePrescription,
  WaitingRoomEntry,
  CreateSessionData,
  UpdateSessionData,
  CreatePrescriptionData,
  SendMessageData,
  JoinSessionData,
  SessionStats,
} from "@/lib/supabase/types/telemedicine";

// Hook para sesiones del paciente
export function usePatientSessions(patientId: string | undefined) {
  const [sessions, setSessions] = useState<TelemedicineSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    const result = await getPatientSessions(patientId);
    if (result.success) {
      setSessions(result.data);
    } else {
      setError(String(result.error) || 'Error loading patient sessions');
    }
    setLoading(false);
  }, [patientId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadSessions();
  }, [loadSessions]);

  return { sessions, loading, error, refreshSessions: loadSessions };
}

// Hook para sesiones del doctor
export function useDoctorSessions(doctorId: string | undefined) {
  const [sessions, setSessions] = useState<TelemedicineSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    if (!doctorId) return;
    setLoading(true);
    const result = await getDoctorSessions(doctorId);
    if (result.success) {
      setSessions(result.data);
    } else {
      setError(String(result.error) || 'Error loading doctor sessions');
    }
    setLoading(false);
  }, [doctorId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadSessions();
  }, [loadSessions]);

  return { sessions, loading, error, refreshSessions: loadSessions };
}

// Hook para una sesión específica
export function useSession(sessionId: string | undefined) {
  const [session, setSession] = useState<TelemedicineSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSession = useCallback(async () => {
    if (!sessionId) return;
    setLoading(true);
    const result = await getSession(sessionId);
    if (result.success) {
      setSession(result.data);
    } else {
      setError(String(result.error) || 'Error loading session');
    }
    setLoading(false);
  }, [sessionId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadSession();
  }, [loadSession]);

  return { session, loading, error, refreshSession: loadSession };
}

// Hook para crear sesión
export function useCreateSession() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (patientId: string, sessionData: CreateSessionData) => {
    setLoading(true);
    setError(null);
    const result = await createTelemedicineSession(patientId, sessionData);
    setLoading(false);
    if (!result.success) {
      setError(String(result.error) || 'Error creating session');
    }
    return result;
  };

  return { create, loading, error };
}

// Hook para gestionar sesión activa
export function useActiveSession(sessionId: string | undefined) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = async () => {
    if (!sessionId) return { success: false, error: "No session ID" };
    setLoading(true);
    setError(null);
    const result = await startSession(sessionId);
    setLoading(false);
    if (!result.success) {
      setError(String(result.error) || 'Error starting session');
    }
    return result;
  };

  const end = async (notes?: string) => {
    if (!sessionId) return { success: false, error: "No session ID" };
    setLoading(true);
    setError(null);
    const result = await endSession(sessionId, notes);
    setLoading(false);
    if (!result.success) {
      setError(String(result.error) || 'Error ending session');
    }
    return result;
  };

  const update = async (updates: UpdateSessionData) => {
    if (!sessionId) return { success: false, error: "No session ID" };
    setLoading(true);
    setError(null);
    const result = await updateSession(sessionId, updates);
    setLoading(false);
    if (!result.success) {
      setError(String(result.error) || 'Error updating session');
    }
    return result;
  };

  return { start, end, update, loading, error };
}

// Hook para participantes
export function useSessionParticipants(sessionId: string | undefined) {
  const [participants, setParticipants] = useState<TelemedicineParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadParticipants = useCallback(async () => {
    if (!sessionId) return;
    setLoading(true);
    const result = await getSessionParticipants(sessionId);
    if (result.success) {
      setParticipants(result.data);
    } else {
      setError(String(result.error) || 'Error loading participants');
    }
    setLoading(false);
  }, [sessionId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadParticipants();
  }, [loadParticipants]);

  const join = async (userId: string, joinData: JoinSessionData) => {
    const result = await joinSession(userId, joinData);
    if (result.success) {
      await loadParticipants();
    }
    return result;
  };

  const leave = async (participantId: string) => {
    const result = await leaveSession(participantId);
    if (result.success) {
      await loadParticipants();
    }
    return result;
  };

  return { participants, loading, error, join, leave, refreshParticipants: loadParticipants };
}

// Hook para chat
export function useSessionChat(sessionId: string | undefined) {
  const [messages, setMessages] = useState<TelemedicineChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    if (!sessionId) return;
    setLoading(true);
    const result = await getSessionMessages(sessionId);
    if (result.success) {
      setMessages(result.data);
    } else {
      setError(String(result.error) || 'Error loading messages');
    }
    setLoading(false);
  }, [sessionId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadMessages();
  }, [loadMessages]);

  const send = async (senderId: string, messageData: SendMessageData) => {
    const result = await sendMessage(senderId, messageData);
    if (result.success) {
      await loadMessages();
    }
    return result;
  };

  const markAsRead = async (userId: string) => {
    if (!sessionId) return;
    const result = await markMessagesAsRead(sessionId, userId);
    if (result.success) {
      await loadMessages();
    }
    return result;
  };

  return { messages, loading, error, send, markAsRead, refreshMessages: loadMessages };
}

// Hook para recetas
export function usePatientPrescriptions(patientId: string | undefined) {
  const [prescriptions, setPrescriptions] = useState<TelemedicinePrescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPrescriptions = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    const result = await getPatientPrescriptions(patientId);
    if (result.success) {
      setPrescriptions(result.data);
    } else {
      setError(String(result.error) || 'Error loading prescriptions');
    }
    setLoading(false);
  }, [patientId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadPrescriptions();
  }, [loadPrescriptions]);

  return { prescriptions, loading, error, refreshPrescriptions: loadPrescriptions };
}

// Hook para crear receta
export function useCreatePrescription() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (
    doctorId: string,
    patientId: string,
    prescriptionData: CreatePrescriptionData
  ) => {
    setLoading(true);
    setError(null);
    const result = await createPrescription(doctorId, patientId, prescriptionData);
    setLoading(false);
    if (!result.success) {
      setError(String(result.error) || 'Error creating prescription');
    }
    return result;
  };

  return { create, loading, error };
}

// Hook para sala de espera (paciente)
export function useWaitingRoom() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enter = async (
    patientId: string,
    sessionId: string,
    reasonForVisit?: string,
    priority?: 'low' | 'normal' | 'high' | 'urgent'
  ) => {
    setLoading(true);
    setError(null);
    const result = await enterWaitingRoom(patientId, sessionId, reasonForVisit, priority);
    setLoading(false);
    if (!result.success) {
      setError(String(result.error) || 'Error entering waiting room');
    }
    return result;
  };

  return { enter, loading, error };
}

// Hook para sala de espera (doctor)
export function useDoctorWaitingRoom(doctorId: string | undefined) {
  const [waitingPatients, setWaitingPatients] = useState<WaitingRoomEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWaitingPatients = useCallback(async () => {
    if (!doctorId) return;
    setLoading(true);
    const result = await getWaitingRoomPatients(doctorId);
    if (result.success) {
      setWaitingPatients(result.data);
    } else {
      setError(String(result.error) || 'Error loading waiting patients');
    }
    setLoading(false);
  }, [doctorId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadWaitingPatients();
  }, [loadWaitingPatients]);

  const admit = async (waitingRoomId: string) => {
    const result = await admitPatient(waitingRoomId);
    if (result.success) {
      await loadWaitingPatients();
    }
    return result;
  };

  return { waitingPatients, loading, error, admit, refreshWaitingRoom: loadWaitingPatients };
}

// Hook para estadísticas
export function useSessionStats(patientId: string | undefined) {
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId) return;

    const loadStats = async () => {
      setLoading(true);
      const result = await getPatientSessionStats(patientId);
      if (result.success) {
        setStats(result.data);
      } else {
        setError(String(result.error) || 'Error loading stats');
      }
      setLoading(false);
    };

    loadStats();
  }, [patientId]);

  return { stats, loading, error };
}

