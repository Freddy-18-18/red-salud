"use client";

import { useState, useEffect } from "react";
import { WifiOff, RefreshCw, Pill, AlertTriangle, Heart, Phone } from "lucide-react";
import {
  getMedicalId,
  getMedications,
  getAllergies,
  getConditions,
  getEmergencyContacts,
  getLastSync,
  type MedicalIdData,
  type CachedMedication,
  type EmergencyContact,
} from "@/lib/offline/offline-manager";

export default function OfflinePage() {
  const [medicalId, setMedicalId] = useState<MedicalIdData | null>(null);
  const [medications, setMedications] = useState<CachedMedication[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [conditions, setConditions] = useState<string[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [lastSync, setLastSync] = useState<string | null>(null);

  useEffect(() => {
    setMedicalId(getMedicalId());
    setMedications(getMedications());
    setAllergies(getAllergies());
    setConditions(getConditions());
    setEmergencyContacts(getEmergencyContacts());
    setLastSync(getLastSync());
  }, []);

  const handleRetry = () => {
    window.location.href = "/dashboard";
  };

  const hasData = medicalId || medications.length > 0 || allergies.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-6 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
          <WifiOff className="h-8 w-8 text-amber-500" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">Sin conexion</h1>
        <p className="text-sm text-gray-500 mt-1">
          No hay conexion a internet en este momento
        </p>
        {lastSync && (
          <p className="text-xs text-gray-400 mt-2">
            Ultima sincronizacion:{" "}
            {new Date(lastSync).toLocaleDateString("es-VE", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}
      </div>

      <div className="flex-1 p-4 space-y-4 max-w-lg mx-auto w-full">
        {hasData ? (
          <>
            <p className="text-sm text-gray-600 text-center">
              Tu informacion medica importante esta disponible sin conexion:
            </p>

            {/* Medical ID */}
            {medicalId && (
              <section className="bg-white rounded-2xl p-4 border border-gray-100">
                <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-3">
                  <Heart className="h-4 w-4 text-red-500" />
                  Identificacion Medica
                </h2>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Nombre:</span>{" "}
                    <span className="font-medium">{medicalId.full_name}</span>
                  </div>
                  {medicalId.cedula && (
                    <div>
                      <span className="text-gray-500">Cedula:</span>{" "}
                      <span className="font-medium">{medicalId.cedula}</span>
                    </div>
                  )}
                  {medicalId.blood_type && (
                    <div>
                      <span className="text-gray-500">Tipo de sangre:</span>{" "}
                      <span className="font-medium text-red-600">{medicalId.blood_type}</span>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Medications */}
            {medications.length > 0 && (
              <section className="bg-white rounded-2xl p-4 border border-gray-100">
                <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-3">
                  <Pill className="h-4 w-4 text-blue-500" />
                  Medicamentos activos
                </h2>
                <div className="space-y-2">
                  {medications.map((med) => (
                    <div
                      key={med.id}
                      className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {med.medication_name}
                        </p>
                        {med.dosage && (
                          <p className="text-xs text-gray-500">{med.dosage}</p>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">
                        {med.schedule_times.join(", ")}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Allergies */}
            {allergies.length > 0 && (
              <section className="bg-white rounded-2xl p-4 border border-gray-100">
                <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Alergias
                </h2>
                <div className="flex flex-wrap gap-2">
                  {allergies.map((allergy, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium"
                    >
                      {allergy}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Conditions */}
            {conditions.length > 0 && (
              <section className="bg-white rounded-2xl p-4 border border-gray-100">
                <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-3">
                  <Heart className="h-4 w-4 text-purple-500" />
                  Condiciones
                </h2>
                <div className="flex flex-wrap gap-2">
                  {conditions.map((condition, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium"
                    >
                      {condition}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Emergency Contacts */}
            {emergencyContacts.length > 0 && (
              <section className="bg-white rounded-2xl p-4 border border-gray-100">
                <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-3">
                  <Phone className="h-4 w-4 text-emerald-500" />
                  Contactos de emergencia
                </h2>
                <div className="space-y-2">
                  {emergencyContacts.map((contact, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{contact.name}</p>
                        <p className="text-xs text-gray-500">{contact.relationship}</p>
                      </div>
                      <a
                        href={`tel:${contact.phone}`}
                        className="text-sm font-medium text-emerald-600"
                      >
                        {contact.phone}
                      </a>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">
              No hay datos almacenados localmente. Conectate a internet para
              sincronizar tu informacion.
            </p>
          </div>
        )}

        {/* Retry button */}
        <button
          onClick={handleRetry}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors"
        >
          <RefreshCw className="h-5 w-5" />
          Reintentar conexion
        </button>
      </div>
    </div>
  );
}
