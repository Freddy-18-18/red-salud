"use client";

import { useState } from "react";
import { useMedicalSpecialties, useAvailableDoctors } from "@/hooks/use-appointments";

export default function BuscarMedicoPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<string | undefined>();
  const { specialties, loading: specialtiesLoading } = useMedicalSpecialties(true);
  const { doctors, loading: doctorsLoading } = useAvailableDoctors(selectedSpecialtyId);

  const filteredSpecialties = searchQuery
    ? specialties.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : specialties;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Buscar Médico</h1>
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Buscar por nombre o especialidad..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg"
        />
        <button
          onClick={() => setSelectedSpecialtyId(undefined)}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
        >
          Limpiar
        </button>
      </div>

      {/* Specialties Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Especialidades</h2>
        {specialtiesLoading ? (
          <p className="text-gray-500">Cargando especialidades...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredSpecialties.map((specialty) => (
              <button
                key={specialty.id}
                onClick={() => setSelectedSpecialtyId(specialty.id)}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  selectedSpecialtyId === specialty.id
                    ? "border-blue-500 bg-blue-50"
                    : "hover:border-blue-300"
                }`}
              >
                <h3 className="font-semibold text-sm">{specialty.name}</h3>
                {specialty.description && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{specialty.description}</p>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Doctors List */}
      {selectedSpecialtyId && (
        <div>
          <h2 className="text-lg font-semibold mb-3">
            Médicos Disponibles ({doctors.length})
          </h2>
          {doctorsLoading ? (
            <p className="text-gray-500">Cargando médicos...</p>
          ) : doctors.length > 0 ? (
            <div className="space-y-4">
              {doctors.map((doctor) => (
                <div key={doctor.id} className="p-4 border rounded-lg hover:shadow-md transition">
                  <div className="flex items-start gap-4">
                    <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xl font-semibold text-blue-600">
                        {doctor.profile?.nombre_completo?.charAt(0) || "D"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">Dr. {doctor.profile?.nombre_completo || "Médico"}</h3>
                      <p className="text-sm text-gray-500">{doctor.specialty?.name}</p>
                      {doctor.anos_experiencia && doctor.anos_experiencia > 0 && (
                        <p className="text-sm text-gray-600 mt-1">{doctor.anos_experiencia} años de experiencia</p>
                      )}
                      {doctor.tarifa_consulta && (
                        <p className="text-sm font-medium text-green-600 mt-1">${doctor.tarifa_consulta.toFixed(2)} por consulta</p>
                      )}
                      {doctor.biografia && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{doctor.biografia}</p>
                      )}
                      <div className="mt-3">
                        <a
                          href={`/dashboard/citas?doctor=${doctor.id}`}
                          className="inline-block px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                        >
                          Agendar Cita
                        </a>
                      </div>
                    </div>
                    {doctor.verified && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Verificado</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No hay médicos disponibles en esta especialidad</p>
            </div>
          )}
        </div>
      )}

      {!selectedSpecialtyId && !specialtiesLoading && (
        <p className="text-gray-500">Selecciona una especialidad para ver los médicos disponibles.</p>
      )}
    </div>
  );
}
