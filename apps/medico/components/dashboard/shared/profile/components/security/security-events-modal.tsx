"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, History, Loader2, Shield, Lock, Key, Smartphone, AlertTriangle, Check } from "lucide-react";

interface SecurityEventsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SecurityEvent {
  id: string;
  event_type: string;
  event_description: string;
  ip_address: string;
  location: string;
  status: string;
  created_at: string;
}

export function SecurityEventsModal({ isOpen, onClose }: SecurityEventsModalProps) {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadEvents();
    }
  }, [isOpen]);

  const loadEvents = async () => {
    try {
      const response = await fetch("/api/security/events/list?limit=50");
      const data = await response.json();
      if (data.success) {
        setEvents(data.events);
      }
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "password_changed": return <Lock className="h-4 w-4" />;
      case "2fa_enabled": case "2fa_disabled": return <Shield className="h-4 w-4" />;
      case "phone_verified": return <Smartphone className="h-4 w-4" />;
      case "security_questions_updated": return <Key className="h-4 w-4" />;
      case "session_revoked": return <AlertTriangle className="h-4 w-4" />;
      default: return <Check className="h-4 w-4" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case "password_changed": return "bg-blue-100 text-blue-600";
      case "2fa_enabled": return "bg-purple-100 text-purple-600";
      case "2fa_disabled": return "bg-orange-100 text-orange-600";
      case "phone_verified": return "bg-green-100 text-green-600";
      case "security_questions_updated": return "bg-red-100 text-red-600";
      case "session_revoked": return "bg-yellow-100 text-yellow-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[200]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl bg-white rounded-xl shadow-2xl z-[201] p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <History className="h-5 w-5 text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Historial de Seguridad
                </h3>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-12">
                <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No hay eventos de seguridad registrados</p>
              </div>
            ) : (
              <div className="space-y-3">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <div className={`p-2 rounded-lg ${getEventColor(event.event_type)}`}>
                      {getEventIcon(event.event_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {event.event_description}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span>{formatDate(event.created_at)}</span>
                        {event.ip_address && (
                          <>
                            <span>•</span>
                            <span>{event.ip_address}</span>
                          </>
                        )}
                        {event.location && (
                          <>
                            <span>•</span>
                            <span>{event.location}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        event.status === "success"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {event.status === "success" ? "Exitoso" : "Fallido"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
