"use client";

import { X, Search, Send, Loader2, Check, UserCircle } from "lucide-react";
import { useState, useEffect } from "react";

interface Doctor {
  id: string;
  full_name: string;
  specialty: string | null;
}

interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
  onShare: (doctorId: string) => Promise<{ success: boolean }>;
  documentTitle: string;
}

export function ShareDialog({
  open,
  onClose,
  onShare,
  documentTitle,
}: ShareDialogProps) {
  const [search, setSearch] = useState("");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shared, setShared] = useState<string | null>(null);

  // Search for doctors the patient has had appointments with
  useEffect(() => {
    if (!open) return;

    const loadDoctors = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/appointments?page_size=50`);
        if (!res.ok) {
          setLoading(false);
          return;
        }
        const json = await res.json();
        const appointments = json.data ?? [];

        const uniqueDoctors = new Map<string, Doctor>();
        for (const apt of appointments) {
          const doctor = apt.doctor as Record<string, unknown> | null;
          const doctorProfile = (doctor as Record<string, unknown>)?.profile as Record<string, unknown> | null;
          const specialty = (doctor as Record<string, unknown>)?.specialty as Record<string, unknown> | null;
          const doctorId = (doctor as Record<string, unknown>)?.id as string;
          if (doctorId && !uniqueDoctors.has(doctorId)) {
            const fullName = doctorProfile
              ? [doctorProfile.first_name, doctorProfile.last_name].filter(Boolean).join(" ")
              : "Doctor";
            uniqueDoctors.set(doctorId, {
              id: doctorId,
              full_name: fullName || "Doctor",
              specialty: (specialty?.name as string) ?? null,
            });
          }
        }
        setDoctors(Array.from(uniqueDoctors.values()));
      } catch {
        // Non-critical
      }
      setLoading(false);
    };

    loadDoctors();
  }, [open]);

  const filteredDoctors = search
    ? doctors.filter((d) =>
        d.full_name.toLowerCase().includes(search.toLowerCase())
      )
    : doctors;

  const handleShare = async (doctorId: string) => {
    setSharing(true);
    const result = await onShare(doctorId);
    if (result.success) {
      setShared(doctorId);
      setTimeout(() => {
        onClose();
        setShared(null);
        setSearch("");
      }, 1200);
    }
    setSharing(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50 animate-fade-in"
        onClick={onClose}
      />

      <div className="relative z-10 w-full sm:max-w-md max-h-[80vh] bg-white rounded-t-2xl sm:rounded-2xl shadow-xl animate-slide-down">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Compartir documento
            </h2>
            <p className="text-xs text-gray-500 mt-0.5 truncate">
              {documentTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar doctor..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
            />
          </div>
        </div>

        {/* Doctor list */}
        <div className="px-4 pb-4 overflow-y-auto max-h-[50vh]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="text-center py-8">
              <UserCircle className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                {search
                  ? "No se encontraron doctores"
                  : "No tienes doctores con citas previas"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredDoctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-emerald-700">
                        {doctor.full_name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Dr. {doctor.full_name}
                      </p>
                      {doctor.specialty && (
                        <p className="text-xs text-gray-500">
                          {doctor.specialty}
                        </p>
                      )}
                    </div>
                  </div>

                  {shared === doctor.id ? (
                    <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center animate-scale-in">
                      <Check className="h-4 w-4 text-emerald-600" />
                    </div>
                  ) : (
                    <button
                      onClick={() => handleShare(doctor.id)}
                      disabled={sharing}
                      className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 transition"
                    >
                      {sharing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
