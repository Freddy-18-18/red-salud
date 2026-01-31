import { useState, useEffect } from "react";
import {
  getPatientProfile,
  updateBasicProfile,
  updateMedicalInfo,
  type PatientProfile,
} from "@/lib/supabase/services/profile-service";
import { uploadAvatar, uploadDocument } from "@/lib/supabase/services/storage-service";
import {
  getUserPreferences,
  updateUserPreferences,
  getPrivacySettings,
  updatePrivacySettings,
  getNotificationSettings,
  updateNotificationSettings,
} from "@/lib/supabase/services/settings-service";
import type {
  UserPreferences,
  PrivacySettings,
  NotificationSettings,
} from "@/lib/supabase/types";
import {
  getUserActivity,
  getUserSessions,
} from "@/lib/supabase/services/activity-service";
import {
  getPaymentMethods,
  getTransactions,
} from "@/lib/supabase/services/billing-service";
import { getPatientDocuments } from "@/lib/supabase/services/documents-service";

export function usePatientProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings | null>(null);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos iniciales
  useEffect(() => {
    if (!userId) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const [profileData, prefsData, privacyData, notifData] = await Promise.all([
          getPatientProfile(userId),
          getUserPreferences(userId),
          getPrivacySettings(userId),
          getNotificationSettings(userId),
        ]);

        setProfile(profileData);
        setPreferences(prefsData.data || null);
        setPrivacySettings(privacyData.data || null);
        setNotificationSettings(notifData.data || null);
      } catch (err) {
        setError('Error loading profile data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId]);

  // Actualizar perfil básico
  const updateProfile = async (data: Partial<PatientProfile>) => {
    if (!userId) return { success: false };
    const result = await updateBasicProfile(userId, data);
    if (result.success && profile) {
      setProfile({ ...profile, ...data });
    }
    return result;
  };

  // Actualizar información médica
  const updateMedical = async (data: Partial<PatientProfile>) => {
    if (!userId) return { success: false };
    const result = await updateMedicalInfo(userId, data);
    if (result.success && profile) {
      setProfile({ ...profile, ...data });
    }
    return result;
  };

  // Subir avatar
  const updateAvatar = async (file: File) => {
    if (!userId) return { success: false };
    const result = await uploadAvatar(userId, file);
    if (result.success && profile) {
      setProfile({ ...profile, avatar_url: result.url });
    }
    return result;
  };

  // Actualizar preferencias
  const updatePrefs = async (data: Partial<UserPreferences>) => {
    if (!userId) return { success: false };
    const result = await updateUserPreferences(userId, data);
    if (result.success && preferences) {
      setPreferences({ ...preferences, ...data });
    }
    return result;
  };

  // Actualizar privacidad
  const updatePrivacy = async (data: Partial<PrivacySettings>) => {
    if (!userId) return { success: false };
    const result = await updatePrivacySettings(userId, data);
    if (result.success && privacySettings) {
      setPrivacySettings({ ...privacySettings, ...data });
    }
    return result;
  };

  // Actualizar notificaciones
  const updateNotifications = async (data: Partial<NotificationSettings>) => {
    if (!userId) return { success: false };
    const result = await updateNotificationSettings(userId, data);
    if (result.success && notificationSettings) {
      setNotificationSettings({ ...notificationSettings, ...data });
    }
    return result;
  };

  return {
    profile,
    preferences,
    privacySettings,
    notificationSettings,
    loading,
    error,
    updateProfile,
    updateMedical,
    updateAvatar,
    updatePrefs,
    updatePrivacy,
    updateNotifications,
  };
}

// Hook para actividad
export function useUserActivity(userId: string | undefined) {
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const loadActivity = async () => {
      const result = await getUserActivity(userId);
      if (result.success) {
        setActivity(result.data || []);
      }
      setLoading(false);
    };

    loadActivity();
  }, [userId]);

  return { activity, loading };
}

// Hook para sesiones
export function useUserSessions(userId: string | undefined) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const loadSessions = async () => {
      const result = await getUserSessions(userId);
      if (result.success) {
        setSessions(result.data || []);
      }
      setLoading(false);
    };

    loadSessions();
  }, [userId]);

  return { sessions, loading };
}

// Hook para métodos de pago
export function usePaymentMethods(userId: string | undefined) {
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const loadPaymentMethods = async () => {
      const result = await getPaymentMethods(userId);
      if (result.success) {
        setPaymentMethods(result.data || []);
      }
      setLoading(false);
    };

    loadPaymentMethods();
  }, [userId]);

  return { paymentMethods, loading };
}

// Hook para transacciones
export function useTransactions(userId: string | undefined) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const loadTransactions = async () => {
      const result = await getTransactions(userId);
      if (result.success) {
        setTransactions(result.data || []);
      }
      setLoading(false);
    };

    loadTransactions();
  }, [userId]);

  return { transactions, loading };
}

// Hook para documentos
export function usePatientDocuments(userId: string | undefined) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const loadDocuments = async () => {
      const result = await getPatientDocuments(userId);
      if (result.success) {
        setDocuments(result.data || []);
      }
      setLoading(false);
    };

    loadDocuments();
  }, [userId]);

  const uploadDoc = async (file: File, documentType: string, documentName: string) => {
    if (!userId) return { success: false };
    const result = await uploadDocument(userId, file, documentType, documentName);
    if (result.success) {
      // Recargar documentos
      const reloadResult = await getPatientDocuments(userId);
      if (reloadResult.success) {
        setDocuments(reloadResult.data || []);
      }
    }
    return result;
  };

  return { documents, loading, uploadDoc };
}
