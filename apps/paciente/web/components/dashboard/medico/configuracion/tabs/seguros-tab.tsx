/**
 * @file seguros-tab.tsx
 * @description Tab de seguros médicos aceptados
 */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Plus, Trash2, AlertCircle, CheckCircle } from "lucide-react";
import { Button, Input, Label, Badge } from "@red-salud/design-system";
import type { TabComponentProps, MedicalInsurance } from "../types/professional-types";

const SEGUROS_COMUNES = [
  "Seguros Caracas",
  "Seguros Horizonte",
  "Seguros La Previsora",
  "Seguros Universitas",
  "Mapfre La Seguridad",
  "Seguros Catatumbo",
  "Multinacional de Seguros",
  "Seguros Banesco",
  "Seguros Venezuela",
];

export function SegurosTab({ data, isEditing, onUpdate }: TabComponentProps) {
  const [newSeguro, setNewSeguro] = useState<Partial<MedicalInsurance>>({
    name: "",
    plans: [],
    copay_info: "",
  });
  const [newPlan, setNewPlan] = useState("");

  const handleAddSeguro = () => {
    if (!newSeguro.name?.trim()) {
      alert("Por favor ingresa el nombre del seguro");
      return;
    }

    const seguro: MedicalInsurance = {
      id: `ins-${Date.now()}`,
      name: newSeguro.name.trim(),
      plans: newSeguro.plans || [],
      copay_info: newSeguro.copay_info,
    };

    onUpdate({
      seguros_aceptados: [...data.seguros_aceptados, seguro],
    });

    setNewSeguro({
      name: "",
      plans: [],
      copay_info: "",
    });
  };

  const handleDeleteSeguro = (id: string) => {
    onUpdate({
      seguros_aceptados: data.seguros_aceptados.filter((seg) => seg.id !== id),
    });
  };

  const handleAddPlanToNew = () => {
    if (!newPlan.trim()) return;
    if ((newSeguro.plans || []).includes(newPlan.trim())) {
      alert("Este plan ya está agregado");
      return;
    }
    setNewSeguro({
      ...newSeguro,
      plans: [...(newSeguro.plans || []), newPlan.trim()],
    });
    setNewPlan("");
  };

  const handleRemovePlanFromNew = (plan: string) => {
    setNewSeguro({
      ...newSeguro,
      plans: (newSeguro.plans || []).filter((p) => p !== plan),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-xl">
          <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Seguros Médicos Aceptados
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {data.seguros_aceptados.length} seguro(s) registrado(s)
          </p>
        </div>
      </div>

      {/* Lista de seguros */}
      <div className="grid gap-4 md:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {data.seguros_aceptados.map((seguro, index) => (
            <motion.div
              key={seguro.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              className="group relative p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                    <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                      {seguro.name}
                    </h4>
                  </div>

                  {seguro.plans.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                        Planes aceptados:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {seguro.plans.map((plan) => (
                          <Badge
                            key={plan}
                            variant="outline"
                            className="text-xs bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                          >
                            {plan}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {seguro.copay_info && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                      💰 {seguro.copay_info}
                    </p>
                  )}
                </div>

                {isEditing && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteSeguro(seguro.id)}
                    className="text-gray-600 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {data.seguros_aceptados.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No hay seguros registrados</p>
          <p className="text-xs mt-1">
            {isEditing ? "Agrega los seguros médicos que aceptas" : ""}
          </p>
        </div>
      )}

      {/* Formulario para agregar seguro */}
      {isEditing && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-2 border-dashed border-emerald-300 dark:border-emerald-700 rounded-xl space-y-4"
        >
          <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-100">
            <Plus className="h-5 w-5" />
            <h4 className="font-semibold">Agregar Seguro Médico</h4>
          </div>

          {/* Selección rápida de seguros comunes */}
          <div className="space-y-2">
            <Label className="text-sm">Selección Rápida</Label>
            <div className="flex flex-wrap gap-2">
              {SEGUROS_COMUNES.filter(
                (seg) => !data.seguros_aceptados.some((s) => s.name === seg)
              ).map((seguro) => (
                <button
                  key={seguro}
                  onClick={() => setNewSeguro({ ...newSeguro, name: seguro })}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                    newSeguro.name === seguro
                      ? "bg-emerald-500 text-white border-emerald-600"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-emerald-500"
                  }`}
                >
                  {seguro}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-seguro-name">
              Nombre del Seguro <span className="text-red-500">*</span>
            </Label>
            <Input
              id="new-seguro-name"
              value={newSeguro.name || ""}
              onChange={(e) => setNewSeguro({ ...newSeguro, name: e.target.value })}
              placeholder="Ej: Seguros Caracas"
            />
          </div>

          {/* Planes */}
          <div className="space-y-2">
            <Label>Planes Aceptados (Opcional)</Label>
            <div className="flex gap-2">
              <Input
                value={newPlan}
                onChange={(e) => setNewPlan(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddPlanToNew()}
                placeholder="Ej: Plan Gold, Plan Platinum..."
                className="flex-1"
              />
              <Button
                type="button"
                onClick={handleAddPlanToNew}
                disabled={!newPlan.trim()}
                variant="outline"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {(newSeguro.plans || []).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {newSeguro.plans?.map((plan) => (
                  <Badge
                    key={plan}
                    variant="secondary"
                    className="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100"
                  >
                    {plan}
                    <button
                      onClick={() => handleRemovePlanFromNew(plan)}
                      className="ml-2 hover:text-emerald-600"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-seguro-copay">Información de Copago (Opcional)</Label>
            <Input
              id="new-seguro-copay"
              value={newSeguro.copay_info || ""}
              onChange={(e) =>
                setNewSeguro({ ...newSeguro, copay_info: e.target.value })
              }
              placeholder="Ej: Copago 20%, Sin copago en emergencias"
            />
          </div>

          <Button
            onClick={handleAddSeguro}
            disabled={!newSeguro.name?.trim()}
            className="w-full gap-2"
          >
            <Plus className="h-4 w-4" />
            Agregar Seguro
          </Button>
        </motion.div>
      )}

      {!isEditing && data.seguros_aceptados.length > 0 && (
        <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
              <strong>Nota:</strong> Los pacientes con estos seguros podrán identificarte
              más fácilmente en las búsquedas.
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
