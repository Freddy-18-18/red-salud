/**
 * @file formacion-tab.tsx
 * @description Tab de formación académica del médico
 */

"use client";

import { motion } from "framer-motion";
import { GraduationCap, Award, Calendar, Building2 } from "lucide-react";
import { Input, Label } from "@red-salud/design-system";
import type { TabComponentProps } from "../types/professional-types";

export function FormacionTab({ data, isEditing, onUpdate }: TabComponentProps) {
  const currentYear = new Date().getFullYear();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Título de sección */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-gradient-to-br from-purple-500/10 to-violet-500/10 rounded-xl">
          <GraduationCap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Formación Académica
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Información sobre tu educación médica
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Universidad */}
        <div className="space-y-2">
          <Label
            htmlFor="universidad"
            className="flex items-center gap-2 text-sm font-medium"
          >
            <Building2 className="h-4 w-4 text-purple-600" />
            Universidad de Egreso
          </Label>
          {isEditing ? (
            <Input
              id="universidad"
              value={data.universidad}
              onChange={(e) => onUpdate({ universidad: e.target.value })}
              placeholder="Ej: Universidad Central de Venezuela"
              className="transition-all focus:border-purple-500 focus:ring-purple-500/20"
            />
          ) : (
            <p className="text-base text-gray-700 dark:text-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              {data.universidad || "No especificado"}
            </p>
          )}
        </div>

        {/* Año de Graduación */}
        <div className="space-y-2">
          <Label
            htmlFor="anio_graduacion"
            className="flex items-center gap-2 text-sm font-medium"
          >
            <Calendar className="h-4 w-4 text-purple-600" />
            Año de Graduación
          </Label>
          {isEditing ? (
            <Input
              id="anio_graduacion"
              type="number"
              min={1950}
              max={currentYear}
              value={data.anio_graduacion || ""}
              onChange={(e) =>
                onUpdate({
                  anio_graduacion: e.target.value
                    ? parseInt(e.target.value)
                    : null,
                })
              }
              placeholder={`Ej: ${currentYear - 5}`}
              className="transition-all focus:border-purple-500 focus:ring-purple-500/20"
            />
          ) : (
            <p className="text-base text-gray-700 dark:text-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              {data.anio_graduacion || "No especificado"}
            </p>
          )}
        </div>

        {/* Número de Colegio */}
        <div className="space-y-2">
          <Label
            htmlFor="numero_colegio"
            className="flex items-center gap-2 text-sm font-medium"
          >
            <Award className="h-4 w-4 text-purple-600" />
            Número de Colegio Médico
          </Label>
          {isEditing ? (
            <Input
              id="numero_colegio"
              value={data.numero_colegio}
              onChange={(e) => onUpdate({ numero_colegio: e.target.value })}
              placeholder="Ej: 12345"
              className="transition-all focus:border-purple-500 focus:ring-purple-500/20"
            />
          ) : (
            <p className="text-base text-gray-700 dark:text-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              {data.numero_colegio || "No especificado"}
            </p>
          )}
        </div>

        {/* Años de Experiencia */}
        <div className="space-y-2">
          <Label
            htmlFor="anios_experiencia"
            className="flex items-center gap-2 text-sm font-medium"
          >
            <GraduationCap className="h-4 w-4 text-purple-600" />
            Años de Experiencia
          </Label>
          {isEditing ? (
            <Input
              id="anios_experiencia"
              type="number"
              min={0}
              max={60}
              value={data.anios_experiencia}
              onChange={(e) =>
                onUpdate({
                  anios_experiencia: parseInt(e.target.value) || 0,
                })
              }
              placeholder="Ej: 5"
              className="transition-all focus:border-purple-500 focus:ring-purple-500/20"
            />
          ) : (
            <p className="text-base text-gray-700 dark:text-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              {data.anios_experiencia > 0
                ? `${data.anios_experiencia} ${data.anios_experiencia === 1 ? "año" : "años"}`
                : "No especificado"}
            </p>
          )}
        </div>
      </div>

      {/* Matrícula SACS - Solo lectura */}
      {data.matricula && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800 rounded-xl"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
              <Award className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-green-900 dark:text-green-100">
                  Matrícula Verificada
                </h4>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-600 text-white">
                  SACS ✓
                </span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300">
                {data.matricula}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                Verificado por el SACS (Sistema de Autenticación de Credenciales)
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Información adicional si no está editando */}
      {!isEditing && (
        <div className="mt-8 p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-xl">
          <p className="text-sm text-purple-700 dark:text-purple-300">
            💡 <strong>Tip:</strong> Mantén tu información actualizada para que
            los pacientes puedan conocer mejor tu formación académica.
          </p>
        </div>
      )}
    </motion.div>
  );
}
