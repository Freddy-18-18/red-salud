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
} from "lucide-react";

interface SecurityTabProps {
  userEmail: string;
}

export function SecurityTab({ userEmail }: SecurityTabProps) {
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

          <button className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Lock className="h-5 w-5 text-blue-600" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Cambiar Contraseña
                </p>
                <p className="text-xs text-gray-500">
                  Última actualización: Hace 3 meses
                </p>
              </div>
            </div>
            <Edit2 className="h-4 w-4 text-gray-400" aria-hidden="true" />
          </button>

          <button className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="h-5 w-5 text-purple-600" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Autenticación de Dos Factores (2FA)
                </p>
                <p className="text-xs text-gray-500">
                  Agrega una capa extra de seguridad
                </p>
              </div>
            </div>
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              Configurar
            </span>
          </button>

          <button className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Mail className="h-5 w-5 text-green-600" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Verificación de Email
                </p>
                <p className="text-xs text-gray-500">{userEmail}</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full">
              <Check className="h-3 w-3" aria-hidden="true" />
              Verificado
            </span>
          </button>

          <button className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Smartphone className="h-5 w-5 text-orange-600" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Verificación de Teléfono
                </p>
                <p className="text-xs text-gray-500">
                  Verifica tu número de teléfono
                </p>
              </div>
            </div>
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              Verificar
            </span>
          </button>

          <button className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Key className="h-5 w-5 text-red-600" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Preguntas de Seguridad
                </p>
                <p className="text-xs text-gray-500">
                  Para recuperación de cuenta
                </p>
              </div>
            </div>
            <Edit2 className="h-4 w-4 text-gray-400" aria-hidden="true" />
          </button>
        </section>

        {/* Columna Derecha - Notificaciones */}
        <section className="space-y-4">
          <h3 className="font-semibold text-gray-900 mb-3">
            Notificaciones de Seguridad
          </h3>

          <div className="space-y-3">
            {[
              {
                label: "Alertas de Inicio de Sesión",
                description: "Notificar nuevos accesos",
                checked: true,
              },
              {
                label: "Cambios en la Cuenta",
                description: "Modificaciones importantes",
                checked: true,
              },
              {
                label: "Recordatorios de Citas",
                description: "24 horas antes",
                checked: true,
              },
              {
                label: "Resultados de Laboratorio",
                description: "Cuando estén listos",
                checked: true,
              },
              {
                label: "Mensajes de Médicos",
                description: "Respuestas y consultas",
                checked: true,
              },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-gray-600" aria-hidden="true" />
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
                    defaultChecked={item.checked}
                    aria-label={`Activar ${item.label}`}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>

          <aside className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
            <div className="flex items-start gap-3">
              <AlertCircle
                className="h-5 w-5 text-yellow-600 mt-0.5"
                aria-hidden="true"
              />
              <div>
                <h4 className="font-semibold text-yellow-900 mb-1">
                  Recomendación de Seguridad
                </h4>
                <p className="text-sm text-yellow-700">
                  Activa la autenticación de dos factores para mayor seguridad
                  de tu cuenta.
                </p>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </motion.article>
  );
}
