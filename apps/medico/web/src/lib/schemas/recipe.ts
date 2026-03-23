import { z } from "zod";

// =============================================
// MEDICATION SCHEMA
// =============================================
export const medicationSchema = z.object({
    id: z.string().optional(),
    nombre: z.string().min(1, "El medicamento es requerido"),
    nombreComercial: z.string().optional(),
    presentacion: z.string().min(1, "La presentación es requerida"),
    dosis: z.string().min(1, "La dosis es requerida"),
    frecuencia: z.string().min(1, "La frecuencia es requerida"),
    duracion: z.string().min(1, "La duración es requerida"),
    viaAdministracion: z.string().default("Oral"),
    indicacionesAdicionales: z.string().optional(),
});

// =============================================
// PATIENT SCHEMA
// =============================================
export const patientSchema = z.object({
    id: z.string().optional(),
    nombre: z.string().min(1, "El nombre es requerido"),
    apellido: z.string().optional(),
    edad: z.number().min(0, "La edad debe ser mayor a 0").max(150),
    unidadEdad: z.enum(["años", "meses", "días"]).default("años"),
    peso: z.number().optional(),
    sexo: z.enum(["masculino", "femenino", "otro"]).optional(),
    cedula: z.string().optional(),
});

// =============================================
// RECIPE SCHEMA
// =============================================
export const recipeSchema = z.object({
    paciente: patientSchema,
    medicamentos: z
        .array(medicationSchema)
        .min(1, "Agregue al menos un medicamento"),
    diagnostico: z.string().optional(),
    indicacionesGenerales: z.string().optional(),
    proximoControl: z.string().optional(),
    fecha: z.date().default(() => new Date()),
});

// =============================================
// TYPES
// =============================================
export type Medication = z.infer<typeof medicationSchema>;
export type Patient = z.infer<typeof patientSchema>;
export type Recipe = z.infer<typeof recipeSchema>;

// Default values for form initialization
export const defaultMedication: Medication = {
    nombre: "",
    presentacion: "",
    dosis: "",
    frecuencia: "",
    duracion: "",
    viaAdministracion: "Oral",
    indicacionesAdicionales: "",
};

export const defaultPatient: Partial<Patient> = {
    nombre: "",
    edad: 0,
    unidadEdad: "años",
};

export const defaultRecipe: Partial<Recipe> = {
    paciente: defaultPatient as Patient,
    medicamentos: [defaultMedication],
    fecha: new Date(),
};
