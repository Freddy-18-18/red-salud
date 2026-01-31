import { useState } from "react";
import type { FormData } from "../types";

export function useProfileForm(initialData: Partial<FormData>) {
  const [formData, setFormData] = useState<FormData>({
    nombre: initialData.nombre || "",
    email: initialData.email || "",
    telefono: initialData.telefono || "",
    cedula: initialData.cedula || "",
    fechaNacimiento: initialData.fechaNacimiento || "",
    direccion: initialData.direccion || "",
    ciudad: initialData.ciudad || "",
    estado: initialData.estado || "",
    codigoPostal: initialData.codigoPostal || "",
    tipoSangre: initialData.tipoSangre || "",
    alergias: initialData.alergias || "",
    condicionesCronicas: initialData.condicionesCronicas || "",
    medicamentosActuales: initialData.medicamentosActuales || "",
    cirugiasPrevias: initialData.cirugiasPrevias || "",
    contactoEmergencia: initialData.contactoEmergencia || "",
    telefonoEmergencia: initialData.telefonoEmergencia || "",
    relacionEmergencia: initialData.relacionEmergencia || "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      nombre: initialData.nombre || "",
      email: initialData.email || "",
      telefono: initialData.telefono || "",
      cedula: initialData.cedula || "",
      fechaNacimiento: initialData.fechaNacimiento || "",
      direccion: initialData.direccion || "",
      ciudad: initialData.ciudad || "",
      estado: initialData.estado || "",
      codigoPostal: initialData.codigoPostal || "",
      tipoSangre: initialData.tipoSangre || "",
      alergias: initialData.alergias || "",
      condicionesCronicas: initialData.condicionesCronicas || "",
      medicamentosActuales: initialData.medicamentosActuales || "",
      cirugiasPrevias: initialData.cirugiasPrevias || "",
      contactoEmergencia: initialData.contactoEmergencia || "",
      telefonoEmergencia: initialData.telefonoEmergencia || "",
      relacionEmergencia: initialData.relacionEmergencia || "",
    });
    setIsEditing(false);
  };

  return {
    formData,
    setFormData,
    updateField,
    isEditing,
    setIsEditing,
    isSaving,
    setIsSaving,
    resetForm,
  };
}
