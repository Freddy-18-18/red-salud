"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useMedicalSpecialties, useAvailableDoctors } from "@/hooks/use-appointments";
import { DoctorCard } from "@/components/ui/doctor-card";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonList } from "@/components/ui/skeleton";
import {
  Search,
  SlidersHorizontal,
  X,
  Stethoscope,
  ChevronDown,
} from "lucide-react";

export default function BuscarMedicoPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<string | undefined>();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [showDoctorModal, setShowDoctorModal] = useState(false);

  const { specialties, loading: specialtiesLoading } = useMedicalSpecialties(true);
  const { doctors, loading: doctorsLoading } = useAvailableDoctors(selectedSpecialtyId);

  // Filter doctors by search query
  const filteredDoctors = useMemo(() => {
    if (!searchQuery.trim()) return doctors;
    const q = searchQuery.toLowerCase();
    return doctors.filter((d) =>
      d.profile?.nombre_completo?.toLowerCase().includes(q) ||
      d.specialty?.name.toLowerCase().includes(q) ||
      d.biografia?.toLowerCase().includes(q)
    );
  }, [doctors, searchQuery]);

  // Filter specialties by search query when no specialty is selected
  const filteredSpecialties = useMemo(() => {
    if (!searchQuery.trim()) return specialties;
    const q = searchQuery.toLowerCase();
    return specialties.filter((s) =>
      s.name.toLowerCase().includes(q) ||
      s.description?.toLowerCase().includes(q)
    );
  }, [specialties, searchQuery]);

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId);
  const selectedSpecialty = specialties.find((s) => s.id === selectedSpecialtyId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Buscar Medico</h1>
        <p className="text-gray-500 mt-1">Encuentra al especialista ideal para ti</p>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, especialidad o ubicacion..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 border rounded-xl text-sm font-medium transition ${
            showFilters || selectedSpecialtyId
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">Filtros</span>
        </button>
      </div>

      {/* Active filters */}
      {selectedSpecialtyId && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Filtrando por:</span>
          <button
            onClick={() => setSelectedSpecialtyId(undefined)}
            className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full hover:bg-emerald-100 transition"
          >
            {selectedSpecialty?.name}
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      <div className="flex gap-6">
        {/* Filters sidebar (conditional) */}
        {showFilters && (
          <div className="hidden md:block w-64 flex-shrink-0">
            <div className="bg-white border border-gray-100 rounded-xl p-4 sticky top-24 space-y-4">
              <h3 className="font-semibold text-gray-900 text-sm">Especialidad</h3>
              {specialtiesLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="skeleton h-8 rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="space-y-1 max-h-80 overflow-y-auto">
                  <button
                    onClick={() => setSelectedSpecialtyId(undefined)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                      !selectedSpecialtyId
                        ? "bg-emerald-50 text-emerald-700 font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    Todas las especialidades
                  </button>
                  {specialties.map((specialty) => (
                    <button
                      key={specialty.id}
                      onClick={() => setSelectedSpecialtyId(specialty.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                        selectedSpecialtyId === specialty.id
                          ? "bg-emerald-50 text-emerald-700 font-medium"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {specialty.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results */}
        <div className="flex-1">
          {/* Specialties grid (when no specialty selected) */}
          {!selectedSpecialtyId && !doctorsLoading && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Especialidades</h2>
              {specialtiesLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="skeleton h-20 rounded-xl" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {filteredSpecialties.map((specialty) => (
                    <button
                      key={specialty.id}
                      onClick={() => setSelectedSpecialtyId(specialty.id)}
                      className="p-4 bg-white border border-gray-100 rounded-xl text-left hover:border-emerald-200 hover:shadow-sm transition group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center mb-2 group-hover:bg-emerald-100 transition">
                        <Stethoscope className="h-4 w-4 text-emerald-600" />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900">{specialty.name}</h3>
                      {specialty.description && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{specialty.description}</p>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {!specialtiesLoading && filteredSpecialties.length === 0 && (
                <EmptyState
                  icon={Search}
                  title="No se encontraron especialidades"
                  description={`No hay resultados para "${searchQuery}"`}
                />
              )}
            </div>
          )}

          {/* Doctors list */}
          {selectedSpecialtyId && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900">
                  Medicos disponibles
                  <span className="text-gray-400 font-normal ml-1">
                    ({filteredDoctors.length})
                  </span>
                </h2>
              </div>

              {doctorsLoading ? (
                <SkeletonList count={3} />
              ) : filteredDoctors.length > 0 ? (
                <div className="space-y-3">
                  {filteredDoctors.map((doctor) => (
                    <DoctorCard
                      key={doctor.id}
                      id={doctor.id}
                      name={doctor.profile?.nombre_completo || "Medico"}
                      specialty={doctor.specialty?.name || ""}
                      avatarUrl={doctor.profile?.avatar_url}
                      fee={doctor.tarifa_consulta}
                      yearsExperience={doctor.anos_experiencia}
                      verified={doctor.verified}
                      onBook={() => {
                        window.location.href = `/dashboard/agendar?doctor=${doctor.id}`;
                      }}
                      onViewProfile={() => {
                        setSelectedDoctorId(doctor.id);
                        setShowDoctorModal(true);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Stethoscope}
                  title="No hay medicos disponibles"
                  description="No se encontraron medicos en esta especialidad. Intenta con otra."
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Doctor detail modal */}
      {showDoctorModal && selectedDoctor && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Close button */}
              <div className="flex justify-end mb-2">
                <button
                  onClick={() => setShowDoctorModal(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Doctor info */}
              <div className="text-center mb-6">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-emerald-50 flex items-center justify-center overflow-hidden mb-4">
                  {selectedDoctor.profile?.avatar_url ? (
                    <img
                      src={selectedDoctor.profile.avatar_url}
                      alt={selectedDoctor.profile?.nombre_completo}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-emerald-600">
                      {selectedDoctor.profile?.nombre_completo?.charAt(0) || "D"}
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Dr. {selectedDoctor.profile?.nombre_completo}
                </h2>
                <p className="text-gray-500">{selectedDoctor.specialty?.name}</p>
                {selectedDoctor.verified && (
                  <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">
                    Medico verificado
                  </span>
                )}
              </div>

              {/* Details */}
              <div className="space-y-4">
                {selectedDoctor.biografia && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">Acerca de</h3>
                    <p className="text-sm text-gray-600">{selectedDoctor.biografia}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  {selectedDoctor.anos_experiencia != null && selectedDoctor.anos_experiencia > 0 && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">Experiencia</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedDoctor.anos_experiencia} anos</p>
                    </div>
                  )}
                  {selectedDoctor.tarifa_consulta != null && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">Consulta</p>
                      <p className="text-sm font-semibold text-emerald-600">${selectedDoctor.tarifa_consulta.toFixed(2)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* CTA */}
              <div className="mt-6 flex gap-2">
                <button
                  onClick={() => setShowDoctorModal(false)}
                  className="flex-1 py-3 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition"
                >
                  Cerrar
                </button>
                <a
                  href={`/dashboard/agendar?doctor=${selectedDoctor.id}`}
                  className="flex-1 py-3 bg-emerald-500 text-white text-sm font-medium rounded-xl hover:bg-emerald-600 transition text-center"
                >
                  Agendar Cita
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
