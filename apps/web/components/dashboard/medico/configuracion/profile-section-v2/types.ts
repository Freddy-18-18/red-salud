/**
 * @file types.ts
 * @description TypeScript types para ProfileSectionV2
 */

export interface ProfileData {
  nombre_completo: string;
  email: string;
  telefono: string;
  cedula: string;
  especialidad: string;
  especialidades_adicionales: string[];
  biografia: string;
  avatar_url: string | null;
  is_verified: boolean;
  especialidades_permitidas: string[];
}

export type ProfileLevel = "basic" | "complete" | "professional" | "elite";

export interface ProfileCompleteness {
  percentage: number;
  level: ProfileLevel;
  missingFields: string[];
  nextLevelRequirements: string[];
}

export interface BioAnalysis {
  wordCount: number;
  readabilityScore: number;
  hasCredentials: boolean;
  hasExperience: boolean;
  hasSpecialties: boolean;
  suggestions: string[];
}

export interface ProfileMetrics {
  visibility: number;
  trustScore: number;
  completeness: number;
  conversionRate: number;
}
