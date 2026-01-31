"use client";

import { useState } from "react";
import { AlertCircle, Edit2, Phone, User } from "lucide-react";
import { Button } from "@red-salud/ui";
import { EmergencyContactModal } from "./emergency-contact-modal";

interface EmergencyContactData {
  contactoEmergencia: string;
  telefonoEmergencia: string;
  relacionEmergencia: string;
}

interface EmergencyContactCardProps {
  contactoEmergencia: string;
  telefonoEmergencia: string;
  relacionEmergencia: string;
  onUpdate: (data: EmergencyContactData) => Promise<void>;
}

export function EmergencyContactCard({
  contactoEmergencia,
  telefonoEmergencia,
  relacionEmergencia,
  onUpdate,
}: EmergencyContactCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Verificar que ambos campos tengan contenido válido
  const hasContact = Boolean(
    contactoEmergencia && 
    contactoEmergencia.trim() !== "" && 
    telefonoEmergencia && 
    telefonoEmergencia.trim() !== ""
  );

  // Debug: ver qué valores están llegando
  console.log("🔍 EmergencyContactCard - Props:", {
    contactoEmergencia,
    telefonoEmergencia,
    relacionEmergencia,
    hasContact,
  });

  return (
    <>
      <div
        className={`rounded-lg border-2 p-4 transition-all ${
          hasContact
            ? "bg-green-50 border-green-200"
            : "bg-red-50 border-red-200"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div
              className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                hasContact ? "bg-green-100" : "bg-red-100"
              }`}
            >
              <AlertCircle
                className={`h-5 w-5 ${
                  hasContact ? "text-green-600" : "text-red-600"
                }`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3
                className={`font-semibold text-sm mb-1 ${
                  hasContact ? "text-green-900" : "text-red-900"
                }`}
              >
                🚨 Contacto de Emergencia
              </h3>
              {hasContact ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-green-800">
                    <User className="h-4 w-4 shrink-0" />
                    <span className="font-medium truncate">
                      {contactoEmergencia}
                    </span>
                    {relacionEmergencia && (
                      <span className="text-xs bg-green-100 px-2 py-0.5 rounded capitalize">
                        {relacionEmergencia}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-green-800">
                    <Phone className="h-4 w-4 shrink-0" />
                    <span className="truncate">{telefonoEmergencia}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-red-700">
                  No has configurado un contacto de emergencia. Es importante
                  tener esta información actualizada.
                </p>
              )}
            </div>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="outline"
            size="sm"
            className={
              hasContact
                ? "border-green-300 hover:bg-green-100"
                : "border-red-300 hover:bg-red-100"
            }
          >
            <Edit2 className="h-3 w-3 mr-1" />
            {hasContact ? "Editar" : "Agregar"}
          </Button>
        </div>
      </div>

      <EmergencyContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        contactoEmergencia={contactoEmergencia}
        telefonoEmergencia={telefonoEmergencia}
        relacionEmergencia={relacionEmergencia}
        onSave={async (data: EmergencyContactData) => {
          try {
            await onUpdate(data);
            // Solo cerrar el modal si el guardado fue exitoso
            setIsModalOpen(false);
          } catch (error) {
            // El error ya se maneja en el modal, solo lo propagamos
            throw error;
          }
        }}
      />
    </>
  );
}
