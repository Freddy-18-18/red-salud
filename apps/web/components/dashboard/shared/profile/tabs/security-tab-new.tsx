"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Lock,
  Shield,
  Mail,
  Smartphone,
  Key,
  Bell,
  Check,
  AlertCircle,
  Edit2,
  X,
  Eye,
  EyeOff,
  Loader2,
  Monitor,
  Clock,
  MapPin,
  History,
} from "lucide-react";
import { ChangePasswordModal } from "../components/security/change-password-modal";
import { Setup2FAModal } from "../components/security/setup-2fa-modal";
import { VerifyPhoneModal } from "../components/security/verify-phone-modal";
import { SecurityQuestionsModal } from "../components/security/security-questions-modal";
import { SecurityEventsModal } from "../components/security/security-events-modal";
import { ActiveSessionsModal } from "../components/security/active-sessions-modal";

interface SecurityTabProps {
  userEmail: string;
  userId: string;
}

interface NotificationSettings {
  login_alerts: boolean;
  account_changes: boolean;
  appointment_reminders: boolean;
  lab_results: boolean;
  doctor_messages: boolean;
  security_alerts: boolean;
  password_changes: boolean;
  new_device_login: boolean;
  suspicious_activity: boolean;
}

export function SecurityTabNew({ userEmail, userId }: SecurityTabProps) {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Inicializar con valores por defecto - sin loading
  const [notifications, setNotifications] = useState<NotificationSettings>({
    login_alerts: true,
    account_changes: true,
    appointment_reminders: true,
    lab_results: true,
    doctor_messages: true,
    security_alerts: true,
    password_changes: true,
    new_device_login: true,
    suspicious_activity: true,
  });

  const [has2FA, setHas2FA] = useState(false);
  const [hasSecurityQuestions, setHasSecurityQuestions] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);

  // Cargar configuraciones en segundo plano sin bloquear la UI
  useEffect(() => {
    loadSecuritySettingsInBackground();
  }, [loadSecuritySettingsInBackground]);

  const loadSecuritySettingsInBackground = useCallback(async () => {
    try {
      // TODO: Implementar llamadas reales cuando las APIs estén listas
      // Por ahora, simular datos locales

      // Cargar desde localStorage o Supabase
      const stored = localStorage.getItem(`security_settings_${userId}`);
      if (stored) {
        const data = JSON.parse(stored);
        if (data.notifications) setNotifications(data.notifications);
        if (data.has2FA !== undefined) setHas2FA(data.has2FA);
        if (data.hasSecurityQuestions !== undefined) setHasSecurityQuestions(data.hasSecurityQuestions);
        if (data.phoneVerified !== undefined) setPhoneVerified(data.phoneVerified);
      }
    } catch (error) {
      console.error("Error loading security settings:", error);
    }
  }, [userId]);

  const handleNotificationToggle = (key: keyof NotificationSettings) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);

    // Guardar en localStorage
    try {
      const stored = localStorage.getItem(`security_settings_${userId}`) || "{}";
      const data = JSON.parse(stored);
      data.notifications = updated;
      localStorage.setItem(`security_settings_${userId}`, JSON.stringify(data));

      // TODO: Sincronizar con backend cuando esté listo
    } catch (error) {
      console.error("Error saving notifications:", error);
    }
  };

  return (
    <motion.article
      key="security"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      <header className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Seguridad de la Cuenta
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Protege tu cuenta y mantén tu información segura
        </p>
      </header>

      <div className="grid grid-cols-2 gap-6">
        {/* Columna Izquierda - Seguridad */}
        <section className="space-y-4">
          <h3 className="font-semibold text-gray-900 mb-3">
            Configuración de Seguridad
          </h3>

          {/* Cambiar Contraseña */}
          <button
            onClick={() => setActiveModal("password")}
            className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Lock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Cambiar Contraseña
                </p>
                <p className="text-xs text-gray-500">
                  Actualiza tu contraseña regularmente
                </p>
              </div>
            </div>
            <Edit2 className="h-4 w-4 text-gray-400" />
          </button>

          {/* 2FA */}
          <button
            onClick={() => setActiveModal("2fa")}
            className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Autenticación de Dos Factores (2FA)
                </p>
                <p className="text-xs text-gray-500">
                  {has2FA ? "Activado" : "Agrega una capa extra de seguridad"}
                </p>
              </div>
            </div>
            {has2FA ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full">
                <Check className="h-3 w-3" />
                Activo
              </span>
            ) : (
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                Configurar
              </span>
            )}
          </button>

          {/* Verificación de Email */}
          <div className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Mail className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Verificación de Email
                </p>
                <p className="text-xs text-gray-500">{userEmail}</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full">
              <Check className="h-3 w-3" />
              Verificado
            </span>
          </div>

          {/* Verificación de Teléfono */}
          <button
            onClick={() => setActiveModal("phone")}
            className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Smartphone className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Verificación de Teléfono
                </p>
                <p className="text-xs text-gray-500">
                  {phoneVerified ? "Teléfono verificado" : "Verifica tu número de teléfono"}
                </p>
              </div>
            </div>
            {phoneVerified ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full">
                <Check className="h-3 w-3" />
                Verificado
              </span>
            ) : (
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                Verificar
              </span>
            )}
          </button>

          {/* Preguntas de Seguridad */}
          <button
            onClick={() => setActiveModal("questions")}
            className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Key className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Preguntas de Seguridad
                </p>
                <p className="text-xs text-gray-500">
                  {hasSecurityQuestions ? "Configuradas" : "Para recuperación de cuenta"}
                </p>
              </div>
            </div>
            {hasSecurityQuestions ? (
              <Edit2 className="h-4 w-4 text-gray-400" />
            ) : (
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                Configurar
              </span>
            )}
          </button>

          {/* Sesiones Activas */}
          <button
            onClick={() => setActiveModal("sessions")}
            className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Monitor className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Sesiones Activas
                </p>
                <p className="text-xs text-gray-500">
                  Administra tus dispositivos conectados
                </p>
              </div>
            </div>
            <Edit2 className="h-4 w-4 text-gray-400" />
          </button>

          {/* Historial de Seguridad */}
          <button
            onClick={() => setActiveModal("events")}
            className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <History className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Historial de Seguridad
                </p>
                <p className="text-xs text-gray-500">
                  Ver eventos recientes de tu cuenta
                </p>
              </div>
            </div>
            <Edit2 className="h-4 w-4 text-gray-400" />
          </button>
        </section>

        {/* Columna Derecha - Notificaciones */}
        <section className="space-y-4">
          <h3 className="font-semibold text-gray-900 mb-3">
            Notificaciones de Seguridad
          </h3>

          {notifications && (
            <div className="space-y-3">
              {[
                {
                  key: "login_alerts" as keyof NotificationSettings,
                  label: "Alertas de Inicio de Sesión",
                  description: "Notificar nuevos accesos",
                },
                {
                  key: "new_device_login" as keyof NotificationSettings,
                  label: "Nuevos Dispositivos",
                  description: "Accesos desde dispositivos desconocidos",
                },
                {
                  key: "password_changes" as keyof NotificationSettings,
                  label: "Cambios de Contraseña",
                  description: "Cuando se modifica tu contraseña",
                },
                {
                  key: "account_changes" as keyof NotificationSettings,
                  label: "Cambios en la Cuenta",
                  description: "Modificaciones importantes",
                },
                {
                  key: "suspicious_activity" as keyof NotificationSettings,
                  label: "Actividad Sospechosa",
                  description: "Intentos de acceso no autorizados",
                },
                {
                  key: "appointment_reminders" as keyof NotificationSettings,
                  label: "Recordatorios de Citas",
                  description: "24 horas antes",
                },
                {
                  key: "lab_results" as keyof NotificationSettings,
                  label: "Resultados de Laboratorio",
                  description: "Cuando estén listos",
                },
                {
                  key: "doctor_messages" as keyof NotificationSettings,
                  label: "Mensajes de Médicos",
                  description: "Respuestas y consultas",
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {item.label}
                      </p>
                      <p className="text-xs text-gray-500">{item.description}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={notifications[item.key]}
                      onChange={() => handleNotificationToggle(item.key)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          )}

          <aside className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-900 mb-1">
                  Recomendación de Seguridad
                </h4>
                <p className="text-sm text-yellow-700">
                  {!has2FA && "Activa la autenticación de dos factores para mayor seguridad. "}
                  {!hasSecurityQuestions && "Configura preguntas de seguridad para recuperar tu cuenta. "}
                  {!phoneVerified && "Verifica tu teléfono para recibir alertas importantes."}
                </p>
              </div>
            </div>
          </aside>
        </section>
      </div>

      {/* Modales */}
      <ChangePasswordModal
        isOpen={activeModal === "password"}
        onClose={() => setActiveModal(null)}
        userEmail={userEmail}
      />
      <Setup2FAModal
        isOpen={activeModal === "2fa"}
        onClose={() => {
          setActiveModal(null);
          loadSecuritySettingsInBackground();
        }}
        has2FA={has2FA}
      />
      <VerifyPhoneModal
        isOpen={activeModal === "phone"}
        onClose={() => {
          setActiveModal(null);
          loadSecuritySettingsInBackground();
        }}
      />
      <SecurityQuestionsModal
        isOpen={activeModal === "questions"}
        onClose={() => {
          setActiveModal(null);
          loadSecuritySettingsInBackground();
        }}
      />
      <ActiveSessionsModal
        isOpen={activeModal === "sessions"}
        onClose={() => setActiveModal(null)}
      />
      <SecurityEventsModal
        isOpen={activeModal === "events"}
        onClose={() => setActiveModal(null)}
      />
    </motion.article>
  );
}
