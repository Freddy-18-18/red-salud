/**
 * @file atencion-medica-tab.tsx
 * @description Tab de áreas de atención médica (antes "Enfermedades")
 */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Plus, X, Users, AlertCircle } from "lucide-react";
import { Badge, Button, Input, Label, SearchableSelect } from "@red-salud/design-system";
import type { TabComponentProps } from "../types/professional-types";

const GRUPOS_EDAD_OPTIONS = [
  { value: "ninos", label: "Niños (0-12 años)" },
  { value: "adolescentes", label: "Adolescentes (13-17 años)" },
  { value: "adultos", label: "Adultos (18-64 años)" },
  { value: "adultos-mayores", label: "Adultos Mayores (65+ años)" },
];

const IDIOMAS_COMUNES = [
  "Español",
  "Inglés",
  "Portugués",
  "Francés",
  "Italiano",
  "Alemán",
  "Mandarín",
  "Árabe",
];

export function AtencionMedicaTab({
  data,
  isEditing,
  onUpdate,
}: TabComponentProps) {
  const [newCondicion, setNewCondicion] = useState("");
  const [newIdioma, setNewIdioma] = useState("");

  const handleAddCondicion = () => {
    if (!newCondicion.trim()) return;
    if (data.condiciones_tratadas.includes(newCondicion.trim())) {
      alert("Esta condición ya está agregada");
      return;
    }
    onUpdate({
      condiciones_tratadas: [...data.condiciones_tratadas, newCondicion.trim()],
    });
    setNewCondicion("");
  };

  const handleRemoveCondicion = (condicion: string) => {
    onUpdate({
      condiciones_tratadas: data.condiciones_tratadas.filter(
        (c) => c !== condicion
      ),
    });
  };

  const handleAddIdioma = () => {
    if (!newIdioma.trim()) return;
    if (data.idiomas.includes(newIdioma.trim())) {
      alert("Este idioma ya está agregado");
      return;
    }
    onUpdate({
      idiomas: [...data.idiomas, newIdioma.trim()],
    });
    setNewIdioma("");
  };

  const handleRemoveIdioma = (idioma: string) => {
    onUpdate({
      idiomas: data.idiomas.filter((i) => i !== idioma),
    });
  };

  const handleToggleGrupoEdad = (grupo: string) => {
    const grupos = data.grupos_edad || [];
    if (grupos.includes(grupo)) {
      onUpdate({
        grupos_edad: grupos.filter((g) => g !== grupo),
      });
    } else {
      onUpdate({
        grupos_edad: [...grupos, grupo],
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-gradient-to-br from-rose-500/10 to-pink-500/10 rounded-xl">
          <Heart className="h-5 w-5 text-rose-600 dark:text-rose-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Áreas de Atención Médica
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Condiciones y patologías que tratas en tu práctica
          </p>
        </div>
      </div>

      {/* Condiciones Tratadas */}
      <div className="space-y-4">
        <Label className="text-base font-semibold flex items-center gap-2">
          <Heart className="h-4 w-4 text-rose-600" />
          Condiciones que Tratas
        </Label>

        <div className="flex flex-wrap gap-2">
          <AnimatePresence mode="popLayout">
            {data.condiciones_tratadas.map((condicion, index) => (
              <motion.div
                key={condicion}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.03 }}
              >
                <Badge
                  variant="secondary"
                  className="px-3 py-1.5 text-sm bg-gradient-to-r from-rose-100 to-pink-100 dark:from-rose-950 dark:to-pink-950 text-rose-900 dark:text-rose-100 border-rose-200 dark:border-rose-800 hover:shadow-md transition-all"
                >
                  {condicion}
                  {isEditing && (
                    <button
                      onClick={() => handleRemoveCondicion(condicion)}
                      className="ml-2 hover:text-rose-600 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </Badge>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {data.condiciones_tratadas.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <AlertCircle className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay condiciones especificadas</p>
          </div>
        )}

        {isEditing && (
          <div className="flex gap-2">
            <Input
              value={newCondicion}
              onChange={(e) => setNewCondicion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddCondicion()}
              placeholder="Ej: Diabetes tipo 2, Hipertensión..."
              className="flex-1"
            />
            <Button onClick={handleAddCondicion} disabled={!newCondicion.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Grupos de Edad */}
      <div className="space-y-4">
        <Label className="text-base font-semibold flex items-center gap-2">
          <Users className="h-4 w-4 text-rose-600" />
          Grupos de Edad que Atiendes
        </Label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {GRUPOS_EDAD_OPTIONS.map((option) => {
            const isSelected = (data.grupos_edad || []).includes(option.value);
            return (
              <motion.button
                key={option.value}
                onClick={() => isEditing && handleToggleGrupoEdad(option.value)}
                disabled={!isEditing}
                whileHover={isEditing ? { scale: 1.02 } : {}}
                whileTap={isEditing ? { scale: 0.98 } : {}}
                className={`px-4 py-3 rounded-xl border-2 text-left transition-all ${isSelected
                    ? "border-rose-500 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/40 dark:to-pink-950/40 shadow-md"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-rose-300 dark:hover:border-rose-700"
                  } ${!isEditing && "cursor-default"}`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-medium ${isSelected
                        ? "text-rose-900 dark:text-rose-100"
                        : "text-gray-700 dark:text-gray-300"
                      }`}
                  >
                    {option.label}
                  </span>
                  {isSelected && (
                    <div className="h-5 w-5 rounded-full bg-rose-500 flex items-center justify-center">
                      <svg
                        className="h-3 w-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Idiomas */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">Idiomas que Hablas</Label>

        <div className="flex flex-wrap gap-2">
          <AnimatePresence mode="popLayout">
            {data.idiomas.map((idioma, index) => (
              <motion.div
                key={idioma}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.03 }}
              >
                <Badge
                  variant="secondary"
                  className="px-3 py-1.5 text-sm bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-950 dark:to-purple-950 text-indigo-900 dark:text-indigo-100 border-indigo-200 dark:border-indigo-800"
                >
                  {idioma}
                  {isEditing && idioma !== "Español" && (
                    <button
                      onClick={() => handleRemoveIdioma(idioma)}
                      className="ml-2 hover:text-indigo-600 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </Badge>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {isEditing && (
          <div className="flex gap-2">
            <select
              value={newIdioma}
              onChange={(e) => setNewIdioma(e.target.value)}
              className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="">Selecciona un idioma</option>
              {IDIOMAS_COMUNES.filter(
                (idioma) => !data.idiomas.includes(idioma)
              ).map((idioma) => (
                <option key={idioma} value={idioma}>
                  {idioma}
                </option>
              ))}
              <option value="otro">Otro (escribe manualmente)</option>
            </select>
            <Button
              onClick={handleAddIdioma}
              disabled={!newIdioma || newIdioma === "otro"}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}

        {newIdioma === "otro" && (
          <Input
            value=""
            onChange={(e) => setNewIdioma(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddIdioma()}
            placeholder="Escribe el nombre del idioma"
            className="mt-2"
          />
        )}
      </div>

      {!isEditing && (
        <div className="mt-8 p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 rounded-xl">
          <p className="text-sm text-rose-700 dark:text-rose-300">
            💡 <strong>Tip:</strong> Especifica claramente las condiciones que tratas
            para que los pacientes puedan encontrarte más fácilmente. Incluye grupos
            de edad e idiomas para una mejor comunicación.
          </p>
        </div>
      )}
    </motion.div>
  );
}
