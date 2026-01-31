import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Monitor,
  Smartphone,
  MapPin,
  Clock,
  Check,
  Activity as ActivityIcon,
  LogOut,
} from "lucide-react";
import { Button } from "@red-salud/ui";
import { getUserActivity, getUserSessions } from "@/lib/supabase/services/activity-service";

interface ActivityTabProps {
  userId?: string;
}

export function ActivityTab({ userId }: ActivityTabProps) {
  const [activities, setActivities] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId]);

  const loadData = async () => {
    if (!userId) return;
    
    setLoading(true);
    const [activityResult, sessionsResult] = await Promise.all([
      getUserActivity(userId, 10),
      getUserSessions(userId),
    ]);

    if (activityResult.success) {
      setActivities(activityResult.data || []);
    }
    if (sessionsResult.success) {
      setSessions(sessionsResult.data || []);
    }
    setLoading(false);
  };

  return (
    <motion.article
      key="activity"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      <header className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Actividad de la Cuenta
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Revisa el historial de accesos y sesiones activas
        </p>
      </header>

      <div className="grid grid-cols-2 gap-6">
        {/* Sesiones Activas */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Sesiones Activas
            </h3>
            <Button variant="outline" size="sm">
              Cerrar Todas
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Cargando...
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No hay sesiones activas
            </div>
          ) : (
            sessions.map((session, index) => (
              <article
                key={session.id || index}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 dark:bg-gray-800"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      {session.device?.includes("Mobile") ? (
                        <Smartphone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <Monitor className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {session.device || "Dispositivo desconocido"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <MapPin className="h-3 w-3 inline mr-1" />
                        {session.location || "Ubicación desconocida"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {session.last_active_at
                          ? new Date(session.last_active_at).toLocaleString("es-VE")
                          : "Ahora"}
                      </p>
                      {session.is_current && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full mt-2">
                          <Check className="h-3 w-3" />
                          Sesión Actual
                        </span>
                      )}
                    </div>
                  </div>
                  {!session.is_current && (
                    <button
                      className="text-red-600 hover:text-red-700 dark:text-red-400"
                      aria-label="Cerrar sesión"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </article>
            ))
          )}

          <aside className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              <strong>Consejo de Seguridad:</strong> Si ves una sesión que no
              reconoces, ciérrala inmediatamente y cambia tu contraseña.
            </p>
          </aside>
        </section>

        {/* Historial de Actividad */}
        <section className="space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            Historial de Actividad
          </h3>

          {loading ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Cargando...
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No hay actividad reciente
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity, index) => (
                <article
                  key={activity.id || index}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 dark:bg-gray-800"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        activity.status === "success"
                          ? "bg-green-100 dark:bg-green-900/30"
                          : "bg-red-100 dark:bg-red-900/30"
                      }`}
                    >
                      {activity.status === "success" ? (
                        <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <ActivityIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {activity.description || activity.activity_type}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {activity.created_at
                          ? new Date(activity.created_at).toLocaleString("es-VE")
                          : "Fecha desconocida"}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          <Button variant="outline" className="w-full">
            Ver Historial Completo
          </Button>
        </section>
      </div>
    </motion.article>
  );
}
