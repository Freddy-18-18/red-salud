import { motion } from "framer-motion";
import { Edit2, Save, AlertCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TIPOS_SANGRE, RELACIONES_EMERGENCIA } from "../constants";
import type { TabComponentProps } from "../types";

export function MedicalTab({
  formData,
  setFormData,
  isEditing,
  setIsEditing,
  handleSave,
}: TabComponentProps) {
  return (
    <motion.article
      key="medical"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      <header className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Información Médica
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Esta información es confidencial y solo visible para profesionales
            autorizados
          </p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
            <Edit2 className="h-4 w-4 mr-2" aria-hidden="true" />
            Editar
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              onClick={() => setIsEditing(false)}
              variant="outline"
              size="sm"
            >
              Cancelar
            </Button>
            <Button onClick={() => void handleSave()} size="sm">
              <Save className="h-4 w-4 mr-2" aria-hidden="true" />
              Guardar
            </Button>
          </div>
        )}
      </header>

      <form className="grid grid-cols-2 gap-6">
        {/* Columna Izquierda - Información Médica Básica */}
        <fieldset className="space-y-4">
          <legend className="font-semibold text-gray-900 mb-3">
            Información Básica
          </legend>

          <div>
            <Label htmlFor="tipoSangre">Tipo de Sangre *</Label>
            {isEditing ? (
              <select
                id="tipoSangre"
                value={formData.tipoSangre}
                onChange={(e) =>
                  setFormData({ ...formData, tipoSangre: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                aria-required="true"
              >
                <option value="">Seleccionar tipo</option>
                {TIPOS_SANGRE.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-base font-medium text-gray-900 mt-1">
                {formData.tipoSangre || "No registrado"}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="alergias">Alergias</Label>
            {isEditing ? (
              <textarea
                id="alergias"
                placeholder="Ej: Penicilina, mariscos, polen, látex..."
                value={formData.alergias}
                onChange={(e) =>
                  setFormData({ ...formData, alergias: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                aria-describedby="alergias-help"
              />
            ) : (
              <p className="text-base font-medium text-gray-900 mt-1">
                {formData.alergias || "Ninguna registrada"}
              </p>
            )}
            {isEditing && (
              <p id="alergias-help" className="text-xs text-gray-500 mt-1">
                Incluye alergias a medicamentos, alimentos y otras sustancias
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="condicionesCronicas">Condiciones Crónicas</Label>
            {isEditing ? (
              <textarea
                id="condicionesCronicas"
                placeholder="Ej: Diabetes tipo 2, hipertensión, asma..."
                value={formData.condicionesCronicas}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    condicionesCronicas: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              />
            ) : (
              <p className="text-base font-medium text-gray-900 mt-1">
                {formData.condicionesCronicas || "Ninguna registrada"}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="medicamentosActuales">Medicamentos Actuales</Label>
            {isEditing ? (
              <textarea
                id="medicamentosActuales"
                placeholder="Ej: Losartán 50mg (1 vez al día), Metformina 850mg (2 veces al día)..."
                value={formData.medicamentosActuales}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    medicamentosActuales: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              />
            ) : (
              <p className="text-base font-medium text-gray-900 mt-1">
                {formData.medicamentosActuales || "Ninguno registrado"}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="cirugiasPrevias">Cirugías Previas</Label>
            {isEditing ? (
              <textarea
                id="cirugiasPrevias"
                placeholder="Ej: Apendicectomía (2015), Cesárea (2018)..."
                value={formData.cirugiasPrevias}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    cirugiasPrevias: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
              />
            ) : (
              <p className="text-base font-medium text-gray-900 mt-1">
                {formData.cirugiasPrevias || "Ninguna registrada"}
              </p>
            )}
          </div>
        </fieldset>

        {/* Columna Derecha - Contacto de Emergencia */}
        <fieldset className="space-y-4">
          <legend className="font-semibold text-gray-900 mb-3">
            Contacto de Emergencia
          </legend>

          <aside className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle
                className="h-5 w-5 text-red-600 mt-0.5 shrink-0"
                aria-hidden="true"
              />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">
                  Información Crítica
                </h3>
                <p className="text-sm text-red-700">
                  Esta persona será contactada en caso de emergencia médica.
                  Asegúrate de que la información esté actualizada.
                </p>
              </div>
            </div>
          </aside>

          <div>
            <Label htmlFor="contactoEmergencia">Nombre Completo *</Label>
            {isEditing ? (
              <Input
                id="contactoEmergencia"
                placeholder="Nombre completo del contacto"
                value={formData.contactoEmergencia}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contactoEmergencia: e.target.value,
                  })
                }
                required
                aria-required="true"
              />
            ) : (
              <p className="text-base font-medium text-gray-900 mt-1">
                {formData.contactoEmergencia || "No registrado"}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="relacionEmergencia">Relación *</Label>
            {isEditing ? (
              <select
                id="relacionEmergencia"
                value={formData.relacionEmergencia}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    relacionEmergencia: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                aria-required="true"
              >
                <option value="">Seleccionar relación</option>
                {RELACIONES_EMERGENCIA.map((rel) => (
                  <option key={rel.value} value={rel.value}>
                    {rel.label}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-base font-medium text-gray-900 mt-1">
                {formData.relacionEmergencia || "No registrada"}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="telefonoEmergencia">Teléfono *</Label>
            {isEditing ? (
              <Input
                id="telefonoEmergencia"
                type="tel"
                placeholder="+58 412-1234567"
                value={formData.telefonoEmergencia}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    telefonoEmergencia: e.target.value,
                  })
                }
                required
                aria-required="true"
              />
            ) : (
              <p className="text-base font-medium text-gray-900 mt-1">
                {formData.telefonoEmergencia || "No registrado"}
              </p>
            )}
          </div>

          {!isEditing && (
            <aside className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
              <div className="flex items-start gap-3">
                <Check
                  className="h-5 w-5 text-green-600 mt-0.5"
                  aria-hidden="true"
                />
                <div>
                  <h3 className="font-semibold text-green-900 mb-1">
                    Perfil Médico Completo
                  </h3>
                  <p className="text-sm text-green-700">
                    Tu información médica está actualizada. Esto ayuda a los
                    profesionales a brindarte mejor atención.
                  </p>
                </div>
              </div>
            </aside>
          )}
        </fieldset>
      </form>
    </motion.article>
  );
}
