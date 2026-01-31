"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { startOfDay } from "date-fns";
import type { RegisteredPatient, OfflinePatient } from "../utils";

export type ViewMode = "table" | "grid";

export function usePatientsList(doctorId: string | null) {
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<RegisteredPatient[]>([]);
  const [offlinePatients, setOfflinePatients] = useState<OfflinePatient[]>([]);
  const [allPatients, setAllPatients] = useState<(RegisteredPatient | OfflinePatient)[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<(RegisteredPatient | OfflinePatient)[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGender, setFilterGender] = useState<string>("all");
  const [filterAgeRange, setFilterAgeRange] = useState<string>("all");
  const [filterLastVisit, setFilterLastVisit] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [todayAppointments, setTodayAppointments] = useState<number>(0);
  const [newPatientsThisMonth, setNewPatientsThisMonth] = useState<number>(0);

  const loadTodayAppointments = useCallback(async (id: string) => {
    const today = startOfDay(new Date()).toISOString();
    const { data, error } = await supabase
      .from("appointments")
      .select("id")
      .eq("doctor_id", id)
      .gte("appointment_date", today)
      .lt("appointment_date", new Date(new Date().setDate(new Date().getDate() + 1)).toISOString())
      .in("status", ["scheduled", "confirmed"]);
    if (!error && data) setTodayAppointments(data.length);
  }, []);

  const loadPatients = useCallback(async (id: string) => {
    const { data, error } = await supabase
      .from("doctor_patients")
      .select(`*,
        patient:profiles!doctor_patients_patient_id_fkey(
          id,
          nombre_completo,
          email,
          avatar_url,
          fecha_nacimiento,
          genero,
          telefono
        )`)
      .eq("doctor_id", id)
      .eq("status", "active")
      .order("last_consultation_date", { ascending: false, nullsFirst: false });
    if (!error && data) setPatients(data as unknown as RegisteredPatient[]);
  }, []);

  const loadOfflinePatients = useCallback(async (id: string) => {
    const { data, error } = await supabase
      .from("offline_patients")
      .select("*")
      .eq("doctor_id", id)
      .eq("status", "offline")
      .order("created_at", { ascending: false });
    if (!error && data) setOfflinePatients(data as unknown as OfflinePatient[]);
  }, []);

  const loadData = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await Promise.all([loadPatients(id), loadOfflinePatients(id), loadTodayAppointments(id)]);
    } finally {
      setLoading(false);
    }
  }, [loadPatients, loadOfflinePatients, loadTodayAppointments]);

  const filterAndSortPatients = useCallback(() => {
    const filtered = allPatients.filter((p) => {
      const isRegistered = "patient" in p;
      const pData = isRegistered ? (p as RegisteredPatient).patient : (p as OfflinePatient);
      const name = pData.nombre_completo;
      const email = pData.email || "";
      const phone = pData.telefono;
      const cedula = !isRegistered ? (p as OfflinePatient).cedula : "";
      const gender = pData.genero;

      // Calculate Age
      let age = 0;
      if (pData.fecha_nacimiento) {
        const birthDate = new Date(pData.fecha_nacimiento);
        const today = new Date();
        age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
      }

      // Calculate Last Visit
      const lastVisitDate = isRegistered && (p as RegisteredPatient).last_consultation_date
        ? new Date((p as RegisteredPatient).last_consultation_date!)
        : new Date((p as OfflinePatient).created_at); // Fallback to created_at for offline or if no consultation

      const now = new Date();
      const monthsSinceLastVisit = (now.getFullYear() - lastVisitDate.getFullYear()) * 12 + (now.getMonth() - lastVisitDate.getMonth());

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = !q ||
        name.toLowerCase().includes(q) ||
        email.toLowerCase().includes(q) ||
        (phone ?? "").toLowerCase().includes(q) ||
        cedula.toLowerCase().includes(q);

      const matchesGender = filterGender === "all" || gender === filterGender;

      const matchesAge = filterAgeRange === "all" ||
        (filterAgeRange === "0-18" && age <= 18) ||
        (filterAgeRange === "19-60" && age > 18 && age <= 60) ||
        (filterAgeRange === "60+" && age > 60);

      const matchesLastVisit = filterLastVisit === "all" ||
        (filterLastVisit === "recent" && monthsSinceLastVisit < 1) ||
        (filterLastVisit === "medium" && monthsSinceLastVisit >= 1 && monthsSinceLastVisit <= 6) ||
        (filterLastVisit === "long" && monthsSinceLastVisit > 6);

      return matchesSearch && matchesGender && matchesAge && matchesLastVisit;
    });

    if (sortBy === "recent") {
      filtered.sort((a, b) => {
        const isARegistered = "patient" in a;
        const isBRegistered = "patient" in b;
        const dateA = isARegistered && (a as RegisteredPatient).last_consultation_date
          ? new Date((a as RegisteredPatient).last_consultation_date!).getTime()
          : !isARegistered
            ? new Date((a as OfflinePatient).created_at).getTime()
            : 0;
        const dateB = isBRegistered && (b as RegisteredPatient).last_consultation_date
          ? new Date((b as RegisteredPatient).last_consultation_date!).getTime()
          : !isBRegistered
            ? new Date((b as OfflinePatient).created_at).getTime()
            : 0;
        return dateB - dateA;
      });
    } else if (sortBy === "name") {
      filtered.sort((a, b) => {
        const nameA = "patient" in a ? (a as RegisteredPatient).patient.nombre_completo : (a as OfflinePatient).nombre_completo;
        const nameB = "patient" in b ? (b as RegisteredPatient).patient.nombre_completo : (b as OfflinePatient).nombre_completo;
        return nameA.localeCompare(nameB);
      });
    } else if (sortBy === "consultations") {
      filtered.sort((a, b) => {
        const consultA = "patient" in a ? (a as RegisteredPatient).total_consultations : 0;
        const consultB = "patient" in b ? (b as RegisteredPatient).total_consultations : 0;
        return consultB - consultA;
      });
    }

    setFilteredPatients(filtered);
  }, [allPatients, searchQuery, filterGender, filterAgeRange, filterLastVisit, sortBy]);

  useEffect(() => {
    if (!doctorId) return;
    loadData(doctorId);
  }, [doctorId, loadData]);

  useEffect(() => {
    const combined = [
      ...patients.map((p) => ({ ...p, type: "registered" as const })),
      ...offlinePatients.map((p) => ({ ...p, type: "offline" as const })),
    ];
    setAllPatients(combined);

    // Calculate new patients this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const newCount = combined.filter(p => {
      const createdAtStr = "patient" in p ? (p as RegisteredPatient).created_at : (p as OfflinePatient).created_at;
      if (!createdAtStr) return false;
      const createdDate = new Date(createdAtStr);
      return createdDate >= startOfMonth;
    }).length;
    setNewPatientsThisMonth(newCount);

  }, [patients, offlinePatients]);

  useEffect(() => {
    filterAndSortPatients();
  }, [searchQuery, filterGender, filterAgeRange, filterLastVisit, sortBy, allPatients, filterAndSortPatients]);

  return {
    state: {
      loading,
      patients,
      offlinePatients,
      filteredPatients,
      searchQuery,
      filterGender,
      filterAgeRange,
      filterLastVisit,
      sortBy,
      viewMode,
      todayAppointments,
      newPatientsThisMonth,
    },
    actions: {
      setSearchQuery,
      setFilterGender,
      setFilterAgeRange,
      setFilterLastVisit,
      setSortBy,
      setViewMode,
    },
  };
}

