"use client";

import { motion } from "framer-motion";
import { Pen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { DoctorProfileData } from "../../types";

interface MedicalTabDoctorProps {
  formData: DoctorProfileData;
  setFormData: (data: DoctorProfileData) => void;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  handleSave: () => Promise<{ success: boolean; error?: string }>;
}

export function MedicalTabDoctor({
  formData,
  setFormData,
  isEditing,
  setIsEditing,
  handleSave,
}: MedicalTabDoctorProps) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSave();
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <header className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Perfil Profesional
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Información detallada sobre tu práctica médica
          </p>
        </div>
        {!isEditing && (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <Pen className="h-4 w-4 mr-2" />
            Editar
          </Button>
        )}
      </header>

      <form onSubmit={handleSubmit}>
        {/* Layout 2 columnas principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* COLUMNA IZQUIERDA: Información Profesional */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Información Profesional
            </h3>
            
            {/* Biografía */}
            <div>
              <Label htmlFor="bio">Biografía Profesional</Label>
              <p className="text-xs text-gray-500 mb-2">
                Describe tu experiencia y enfoque
              </p>
              {isEditing ? (
                <Textarea
                  id="bio"
                  rows={4}
                  value={formData.bio || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  placeholder="Ej: Médico especialista con 15 años de experiencia..."
                />
              ) : (
                <p className="text-base text-gray-900 mt-2 whitespace-pre-wrap">
                  {formData.bio || "No especificado"}
                </p>
              )}
            </div>

            {/* Certificaciones */}
            <div>
              <Label htmlFor="certificaciones">Certificaciones y Diplomados</Label>
              <p className="text-xs text-gray-500 mb-2">
                Certificaciones, diplomados y cursos
              </p>
              {isEditing ? (
                <Textarea
                  id="certificaciones"
                  rows={3}
                  value={formData.certificaciones || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, certificaciones: e.target.value })
                  }
                  placeholder="Ej: Diplomado en Enfermedades Tropicales (2015)..."
                />
              ) : (
                <p className="text-base text-gray-900 mt-2 whitespace-pre-wrap">
                  {formData.certificaciones || "No especificado"}
                </p>
              )}
            </div>

            {/* Idiomas con botones */}
            <div>
              <Label>Idiomas</Label>
              <p className="text-xs text-gray-500 mb-3">
                Selecciona los idiomas que hablas
              </p>
              {isEditing ? (
                <div className="overflow-x-auto pb-2">
                  <div className="flex gap-2 min-w-max">
                    {['Español', 'Inglés', 'Francés', 'Portugués', 'Italiano', 'Alemán', 'Mandarín', 'Árabe', 'Ruso'].map((idioma) => (
                      <button
                        key={idioma}
                        type="button"
                        className="px-4 py-2 rounded-full border-2 border-gray-300 text-sm font-medium hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-colors whitespace-nowrap"
                      >
                        {idioma}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-base text-gray-900 mt-2">
                  {formData.idiomas || "Español"}
                </p>
              )}
            </div>

            {/* Subespecialidades */}
            <div>
              <Label htmlFor="subespecialidades">Subespecialidades</Label>
              <p className="text-xs text-gray-500 mb-2">
                Áreas específicas de enfoque
              </p>
              {isEditing ? (
                <Textarea
                  id="subespecialidades"
                  rows={3}
                  value={formData.subespecialidades || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, subespecialidades: e.target.value })
                  }
                  placeholder="Ej: Enfermedades infecciosas pediátricas..."
                />
              ) : (
                <p className="text-base text-gray-900 mt-2">
                  {formData.subespecialidades || "No especificado"}
                </p>
              )}
            </div>

            {/* Universidad */}
            <div>
              <Label htmlFor="universidad">Universidad de Egreso</Label>
              <p className="text-xs text-gray-500 mb-2">
                Donde obtuviste tu título
              </p>
              {isEditing ? (
                <Input
                  id="universidad"
                  value={formData.universidad || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, universidad: e.target.value })
                  }
                  placeholder="Ej: Universidad Central de Venezuela (UCV)"
                />
              ) : (
                <p className="text-base text-gray-900 mt-2">
                  {formData.universidad || "No especificado"}
                </p>
              )}
            </div>
          </div>

          {/* COLUMNA DERECHA: Servicios y Tarifas */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Servicios y Tarifas
            </h3>

            {/* Tarifa de Consulta */}
            <div>
              <Label htmlFor="tarifa_consulta">Tarifa de Consulta Presencial</Label>
              <p className="text-xs text-gray-500 mb-2">
                Precio en USD por consulta
              </p>
              {isEditing ? (
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    id="tarifa_consulta"
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="50.00"
                  />
                </div>
              ) : (
                <p className="text-base text-gray-900 mt-2">
                  No especificado
                </p>
              )}
            </div>

            {/* Duración de Consulta */}
            <div>
              <Label htmlFor="duracion_consulta">Duración de Consulta</Label>
              <p className="text-xs text-gray-500 mb-2">
                Tiempo promedio por consulta
              </p>
              {isEditing ? (
                <select
                  id="duracion_consulta"
                  defaultValue="30"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="15">15 minutos</option>
                  <option value="30">30 minutos</option>
                  <option value="45">45 minutos</option>
                  <option value="60">1 hora</option>
                </select>
              ) : (
                <p className="text-base text-gray-900 mt-2">
                  30 minutos
                </p>
              )}
            </div>

            {/* Acepta Seguros */}
            <div>
              <Label>Acepta Seguros</Label>
              <p className="text-xs text-gray-500 mb-2">
                ¿Aceptas pacientes con seguro médico?
              </p>
              {isEditing ? (
                <div className="flex items-center gap-4 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="acepta_seguros"
                      value="si"
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm">Sí</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="acepta_seguros"
                      value="no"
                      defaultChecked
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm">No</span>
                  </label>
                </div>
              ) : (
                <p className="text-base text-gray-900 mt-2">
                  No
                </p>
              )}
            </div>

            {/* Métodos de Pago */}
            <div>
              <Label>Métodos de Pago</Label>
              <p className="text-xs text-gray-500 mb-2">
                Formas de pago que aceptas
              </p>
              {isEditing ? (
                <div className="space-y-2 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                    <span className="text-sm">Efectivo</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                    <span className="text-sm">Transferencia</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                    <span className="text-sm">Pago Móvil</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                    <span className="text-sm">Tarjeta de Crédito</span>
                  </label>
                </div>
              ) : (
                <p className="text-base text-gray-900 mt-2">
                  No especificado
                </p>
              )}
            </div>

            {/* Consulta Virtual - Próximamente */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">🎥</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-purple-900 flex items-center gap-2">
                    Consulta Virtual
                    <span className="text-xs bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full">
                      Próximamente
                    </span>
                  </h4>
                  <p className="text-sm text-purple-700 mt-1">
                    Pronto podrás ofrecer consultas virtuales con tarifas diferenciadas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        {isEditing && (
          <div className="flex gap-3 justify-end pt-6 border-t mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditing(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">Guardar Cambios</Button>
          </div>
        )}
      </form>
    </motion.article>
  );
}
