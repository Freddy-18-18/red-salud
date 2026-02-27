"use client";

import { useState, useEffect } from "react";
import { X, Save, AlertCircle } from "lucide-react";
import { Button } from "@red-salud/design-system";
import { Input } from "@red-salud/design-system";
import { Label } from "@red-salud/design-system";
import { PhoneInput } from "@red-salud/design-system";
import { RELACIONES_EMERGENCIA } from "../constants";

interface EmergencyContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactoEmergencia: string;
  telefonoEmergencia: string;
  relacionEmergencia: string;
  onSave: (data: {
    contactoEmergencia: string;
    telefonoEmergencia: string;
    relacionEmergencia: string;
  }) => Promise<void>;
}

export function EmergencyContactModal({
  isOpen,
  onClose,
  contactoEmergencia,
  telefonoEmergencia,
  relacionEmergencia,
  onSave,
}: EmergencyContactModalProps) {
  const [formData, setFormData] = useState({
    contactoEmergencia: contactoEmergencia || "",
    telefonoEmergencia: telefonoEmergencia || "",
    relacionEmergencia: relacionEmergencia || "",
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        contactoEmergencia: contactoEmergencia || "",
        telefonoEmergencia: telefonoEmergencia || "",
        relacionEmergencia: relacionEmergencia || "",
      });
    }
  }, [isOpen, contactoEmergencia, telefonoEmergencia, relacionEmergencia]);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>("");

  const handleSave = async () => {
    // Limpiar errores previos
    setError("");
    
    // Validar campos requeridos
    if (
      !formData.contactoEmergencia.trim() ||
      !formData.telefonoEmergencia.trim() ||
      !formData.relacionEmergencia
    ) {
      setError("Por favor completa todos los campos");
      return;
    }

    setIsSaving(true);
    try {
      await onSave(formData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al guardar";
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Contacto de Emergencia
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Persona a contactar en caso de emergencia médica
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Alert */}
        <div className="p-6 pb-0">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-semibold text-red-900 text-sm mb-1">
                  Información Crítica
                </h3>
                <p className="text-sm text-red-700">
                  Esta persona será contactada en caso de emergencia médica.
                  Asegúrate de que la información esté actualizada y que la
                  persona esté al tanto.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          <div>
            <Label htmlFor="contactoEmergencia">Nombre Completo *</Label>
            <Input
              id="contactoEmergencia"
              placeholder="Ej: María Pérez"
              value={formData.contactoEmergencia}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  contactoEmergencia: e.target.value,
                })
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="relacionEmergencia">Relación *</Label>
            <div className="relative">
              <select
                id="relacionEmergencia"
                value={formData.relacionEmergencia}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    relacionEmergencia: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none cursor-pointer"
                required
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%236B7280\' d=\'M6 9L1 4h10z\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '12px' }}
              >
                <option value="">Seleccionar relación</option>
                {RELACIONES_EMERGENCIA.map((rel) => (
                  <option key={rel.value} value={rel.label}>
                    {rel.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="telefonoEmergencia">Teléfono *</Label>
            <PhoneInput
              value={formData.telefonoEmergencia}
              onChange={(value) =>
                setFormData({ ...formData, telefonoEmergencia: value })
              }
            />
            <p className="text-xs text-gray-500 mt-1">
              Asegúrate de que este número esté siempre disponible
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-6 pb-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <Button onClick={onClose} variant="outline" disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
