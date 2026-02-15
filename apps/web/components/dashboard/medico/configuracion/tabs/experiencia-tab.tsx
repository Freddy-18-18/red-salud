/**
 * @file experiencia-tab.tsx
 * @description Tab de experiencia laboral y trayectoria profesional
 */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Plus, Trash2, MapPin, Calendar, AlertCircle } from "lucide-react";
import { Button, Input, Label, Textarea } from "@red-salud/ui";
import type { TabComponentProps, WorkExperience } from "../types/professional-types";

export function ExperienciaTab({ data, isEditing, onUpdate }: TabComponentProps) {
  const [newExp, setNewExp] = useState<Partial<WorkExperience>>({
    institution: "",
    position: "",
    from_year: new Date().getFullYear(),
    to_year: null,
    current: false,
    description: "",
    location: "",
  });

  const handleAddExperience = () => {
    if (!newExp.institution || !newExp.position || !newExp.from_year) {
      alert("Por favor completa los campos requeridos");
      return;
    }

    const experience: WorkExperience = {
      id: `exp-${Date.now()}`,
      institution: newExp.institution,
      position: newExp.position,
      from_year: newExp.from_year,
      to_year: newExp.current ? null : newExp.to_year,
      current: newExp.current || false,
      description: newExp.description,
      location: newExp.location,
    };

    onUpdate({
      experiencia_laboral: [...data.experiencia_laboral, experience],
    });

    setNewExp({
      institution: "",
      position: "",
      from_year: new Date().getFullYear(),
      to_year: null,
      current: false,
      description: "",
      location: "",
    });
  };

  const handleDeleteExperience = (id: string) => {
    onUpdate({
      experiencia_laboral: data.experiencia_laboral.filter((exp) => exp.id !== id),
    });
  };

  // Ordenar por más reciente primero
  const sortedExperiences = [...data.experiencia_laboral].sort((a, b) => {
    if (a.current) return -1;
    if (b.current) return 1;
    return (b.to_year || b.from_year) - (a.to_year || a.from_year);
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl">
          <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Experiencia Profesional
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {data.experiencia_laboral.length} posición(es) registrada(s)
          </p>
        </div>
      </div>

      {/* Timeline de experiencia */}
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {sortedExperiences.map((exp, index) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
              className="relative pl-8 pb-6 border-l-2 border-blue-200 dark:border-blue-800 last:pb-0"
            >
              {/* Dot en timeline */}
              <div className="absolute left-0 top-0 -translate-x-[9px] w-4 h-4 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50" />

              {/* Badge "Actual" */}
              {exp.current && (
                <span className="absolute -top-1 left-8 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                  Actual
                </span>
              )}

              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-lg transition-all duration-300 group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-lg text-gray-900 dark:text-white truncate">
                      {exp.position}
                    </h4>
                    <p className="text-base text-blue-600 dark:text-blue-400 truncate">
                      {exp.institution}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {exp.from_year} -{" "}
                          {exp.current ? "Presente" : exp.to_year || "Presente"}
                        </span>
                      </div>

                      {exp.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{exp.location}</span>
                        </div>
                      )}
                    </div>

                    {exp.description && (
                      <p className="mt-3 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {exp.description}
                      </p>
                    )}
                  </div>

                  {isEditing && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteExperience(exp.id)}
                      className="text-gray-600 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {data.experiencia_laboral.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No hay experiencia laboral registrada</p>
            <p className="text-xs mt-1">
              {isEditing ? "Agrega tu primera experiencia profesional" : ""}
            </p>
          </div>
        )}
      </div>

      {/* Formulario para agregar experiencia */}
      {isEditing && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-xl space-y-4"
        >
          <div className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
            <Plus className="h-5 w-5" />
            <h4 className="font-semibold">Agregar Experiencia Laboral</h4>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="new-exp-position">
                Cargo / Posición <span className="text-red-500">*</span>
              </Label>
              <Input
                id="new-exp-position"
                value={newExp.position || ""}
                onChange={(e) => setNewExp({ ...newExp, position: e.target.value })}
                placeholder="Ej: Médico Residente"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-exp-institution">
                Institución <span className="text-red-500">*</span>
              </Label>
              <Input
                id="new-exp-institution"
                value={newExp.institution || ""}
                onChange={(e) =>
                  setNewExp({ ...newExp, institution: e.target.value })
                }
                placeholder="Ej: Hospital Central"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-exp-location">Ubicación</Label>
              <Input
                id="new-exp-location"
                value={newExp.location || ""}
                onChange={(e) => setNewExp({ ...newExp, location: e.target.value })}
                placeholder="Ej: Caracas, Venezuela"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-exp-from">
                Año Inicio <span className="text-red-500">*</span>
              </Label>
              <Input
                id="new-exp-from"
                type="number"
                min={1950}
                max={new Date().getFullYear()}
                value={newExp.from_year || ""}
                onChange={(e) =>
                  setNewExp({ ...newExp, from_year: parseInt(e.target.value) })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-exp-to">Año Fin</Label>
              <Input
                id="new-exp-to"
                type="number"
                min={newExp.from_year || 1950}
                max={new Date().getFullYear()}
                value={newExp.to_year || ""}
                onChange={(e) =>
                  setNewExp({
                    ...newExp,
                    to_year: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
                disabled={newExp.current}
                placeholder="Dejar vacío si es actual"
              />
            </div>

            <div className="flex items-center space-x-2 pt-8">
              <input
                type="checkbox"
                id="new-exp-current"
                checked={newExp.current || false}
                onChange={(e) =>
                  setNewExp({
                    ...newExp,
                    current: e.target.checked,
                    to_year: e.target.checked ? null : newExp.to_year,
                  })
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <Label htmlFor="new-exp-current" className="cursor-pointer">
                Trabajo actual
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-exp-description">Descripción</Label>
            <Textarea
              id="new-exp-description"
              value={newExp.description || ""}
              onChange={(e) =>
                setNewExp({ ...newExp, description: e.target.value })
              }
              placeholder="Describe tus responsabilidades y logros en este puesto..."
              rows={3}
            />
          </div>

          <Button
            onClick={handleAddExperience}
            disabled={!newExp.institution || !newExp.position || !newExp.from_year}
            className="w-full gap-2"
          >
            <Plus className="h-4 w-4" />
            Agregar Experiencia
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
