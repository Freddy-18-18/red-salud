/**
 * Hook para gestionar permisos de secretarias
 */

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import type { SecretaryPermissions, SecretaryContext } from "@/lib/types/secretary";

export function useSecretaryPermissions() {
  const [context, setContext] = useState<SecretaryContext>({
    currentDoctorId: null,
    availableDoctors: [],
    permissions: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSecretaryContext();
  }, []);

  const loadSecretaryContext = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("No hay usuario autenticado");
      }

      // Obtener todos los médicos vinculados
      const { data: relations, error: relError } = await supabase
        .from("doctor_secretary_relationships")
        .select("*")
        .eq("secretary_id", user.id)
        .eq("status", "active");

      if (relError) throw relError;

      if (!relations || relations.length === 0) {
        setContext({
          currentDoctorId: null,
          availableDoctors: [],
          permissions: null,
        });
        setLoading(false);
        return;
      }

      // Mapear los médicos disponibles
      const doctors = relations.map((rel: any) => ({
        id: rel.doctor_id,
        name: rel.doctor_name,
        email: rel.doctor_email,
        permissions: rel.permissions as SecretaryPermissions,
        status: rel.status,
      }));

      // Por defecto, seleccionar el primer médico
      const firstDoctor = doctors[0];
      
      // Intentar recuperar el médico seleccionado del localStorage
      const savedDoctorId = localStorage.getItem("secretary_current_doctor_id");
      const selectedDoctor = savedDoctorId 
        ? doctors.find(d => d.id === savedDoctorId) || firstDoctor
        : firstDoctor;

      setContext({
        currentDoctorId: selectedDoctor.id,
        availableDoctors: doctors,
        permissions: selectedDoctor.permissions,
      });

    } catch (err: any) {
      console.error("Error loading secretary context:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchDoctor = (doctorId: string) => {
    const doctor = context.availableDoctors.find(d => d.id === doctorId);
    if (!doctor) return;

    setContext(prev => ({
      ...prev,
      currentDoctorId: doctorId,
      permissions: doctor.permissions,
    }));

    // Guardar en localStorage
    localStorage.setItem("secretary_current_doctor_id", doctorId);
  };

  const hasPermission = (permission: keyof SecretaryPermissions): boolean => {
    if (!context.permissions) return false;
    return context.permissions[permission] === true;
  };

  const hasAnyPermission = (permissions: Array<keyof SecretaryPermissions>): boolean => {
    return permissions.some(perm => hasPermission(perm));
  };

  const hasAllPermissions = (permissions: Array<keyof SecretaryPermissions>): boolean => {
    return permissions.every(perm => hasPermission(perm));
  };

  return {
    context,
    loading,
    error,
    switchDoctor,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    reload: loadSecretaryContext,
  };
}
