/**
 * @file statistics-service.ts
 * @description Servicio principal para obtener datos estadísticos del médico.
 * Centraliza todas las queries para el dashboard de estadísticas avanzadas.
 *
 * @module Statistics
 */

import { supabase } from "@/lib/supabase/client";

// ============================================================================
// TIPOS
// ============================================================================

export interface DateRange {
  start: Date;
  end: Date;
}

export interface PatientDemographics {
  ageGroups: Record<string, number>;
  genderDistribution: {
    M: number;
    F: number;
    Other: number;
  };
  totalPatients: number;
  geographicDistribution: {
    cities: Record<string, number>;
    states: Record<string, number>;
  };
}

export interface PatientRetention {
  newPatients: number;
  returningPatients: number;
  retentionRate30d: number;
  retentionRate60d: number;
  retentionRate90d: number;
  inactivePatients: number;
  cohorts: {
    month: string;
    new: number;
    returning: number;
    retained30d: number;
  }[];
}

export interface DiseaseStatistics {
  topDiagnoses: { diagnosis: string; count: number }[];
  icd10Categories: { category: string; count: number }[];
  chronicDiseases: { disease: string; count: number }[];
  comorbidities: { disease1: string; disease2: string; count: number }[];
}

export interface FinancialMetrics {
  totalRevenue: number;
  previousPeriodRevenue: number;
  revenueByType: { type: string; amount: number }[];
  revenueByLocation: { location: string; amount: number }[];
  avgTicket: number;
  revenueChart: { month: string; amount: number }[];
}

export interface TemporalPatterns {
  hourlyDistribution: { hour: number; count: number }[];
  dailyDistribution: { day: string; count: number }[];
  heatmapData: { day: string; hour: number; count: number }[];
}

export interface LabStatistics {
  topTests: { test: string; count: number }[];
  abnormalityRate: number;
  avgDaysToResult: number;
  ordersByStatus: { status: string; count: number }[];
}

export interface EfficiencyMetrics {
  appointmentsPerDay: number;
  avgDuration: number;
  noShowRate: number;
  cancellationRate: number;
  occupancyRate: number;
}

// Database View Interfaces
interface PatientAggView {
  doctor_id: string;
  month: string;
  unique_patients: number;
  new_patients_month: number;
  active_patients_30d: number;
  active_patients_60d: number;
  active_patients_90d: number;
  inactive_patients: number;
}

interface DiagnosisAggView {
  doctor_id: string;
  week: string;
  diagnostico: string;
  cases: number;
}

interface RevenueAggView {
  doctor_id: string;
  month: string;
  status: string;
  gross_revenue: number;
  consultations: number;
  consultation_type: string;
}

interface TemporalPatternView {
  doctor_id: string;
  date: string;
  day_of_week: number;
  hour: number;
  consultations: number;
}

interface LabAggView {
  doctor_id: string;
  month: string;
  total_orders: number;
  abnormal_results: number;
  avg_days_to_result: number;
  status: string;
}

interface EfficiencyAggView {
  doctor_id: string;
  month: string;
  total_appointments: number;
  completed_appointments: number;
  cancelled_appointments: number;
  no_show_appointments: number;
  avg_duration: number;
}

interface AppointmentWithProfile {
  paciente_id: string;
  patient: {
    fecha_nacimiento: string | null;
    genero: string | null;
    ciudad: string | null;
    estado: string | null;
  };
}

// ============================================================================
// SERVICIO PRINCIPAL
// ============================================================================

/**
 * Servicio de estadísticas del médico
 */
export class StatisticsService {
  private doctorId: string;

  constructor(doctorId: string) {
    this.doctorId = doctorId;
  }

  // ===========================================================================
  // 1. DEMOGRAFÍA DE PACIENTES
  // ===========================================================================

  /**
   * Obtiene datos demográficos de los pacientes
   */
  async getPatientDemographics(dateRange: DateRange): Promise<PatientDemographics> {
    try {
      // Obtener pacientes únicos con sus perfiles
      const { data: appointments } = await supabase
        .from("appointments")
        .select("paciente_id, patient:profiles!inner(fecha_nacimiento, genero, ciudad, estado)")
        .eq("medico_id", this.doctorId)
        .gte("created_at", dateRange.start.toISOString())
        .lte("created_at", dateRange.end.toISOString());

      if (!appointments) {
        return this.getEmptyDemographics();
      }

      const uniquePatients = new Map<string, AppointmentWithProfile["patient"]>();
      (appointments as unknown as AppointmentWithProfile[]).forEach((apt) => {
        if (!uniquePatients.has(apt.paciente_id)) {
          uniquePatients.set(apt.paciente_id, apt.patient);
        }
      });

      const patients = Array.from(uniquePatients.values());

      // Calcular grupos de edad
      const ageGroups = { "0-18": 0, "19-35": 0, "36-50": 0, "51-65": 0, "65+": 0 };
      const genderDistribution = { M: 0, F: 0, Other: 0 };
      const cities: Record<string, number> = {};
      const states: Record<string, number> = {};

      patients.forEach((p) => {
        // Edad
        if (p.fecha_nacimiento) {
          const age = this.calculateAge(p.fecha_nacimiento);
          if (age <= 18) ageGroups["0-18"]++;
          else if (age <= 35) ageGroups["19-35"]++;
          else if (age <= 50) ageGroups["36-50"]++;
          else if (age <= 65) ageGroups["51-65"]++;
          else ageGroups["65+"]++;
        }

        // Género
        const g = p.genero?.toLowerCase() || "other";
        if (g === "masculino" || g === "m" || g === "hombre") genderDistribution.M++;
        else if (g === "femenino" || g === "f" || g === "mujer") genderDistribution.F++;
        else genderDistribution.Other++;

        // Ubicación
        if (p.ciudad) {
          cities[p.ciudad] = (cities[p.ciudad] || 0) + 1;
        }
        if (p.estado) {
          states[p.estado] = (states[p.estado] || 0) + 1;
        }
      });

      return {
        ageGroups,
        genderDistribution,
        totalPatients: patients.length,
        geographicDistribution: {
          cities,
          states,
        },
      };
    } catch (error) {
      console.error("[StatisticsService] Error getting patient demographics:", error);
      return this.getEmptyDemographics();
    }
  }

  /**
   * Obtiene métricas de retención de pacientes
   */
  async getPatientRetention(dateRange: DateRange): Promise<PatientRetention> {
    try {
      const { data } = await supabase
        .from("mv_doctor_patients_agg")
        .select("*")
        .eq("doctor_id", this.doctorId)
        .gte("month", dateRange.start.toISOString())
        .lte("month", dateRange.end.toISOString())
        .order("month", { ascending: true });

      const aggData = (data as unknown as PatientAggView[]) || [];

      if (!aggData || aggData.length === 0) {
        return this.getEmptyRetention();
      }

      const latest = aggData[aggData.length - 1];

      if (!latest) {
        return this.getEmptyRetention();
      }

      const totalPatients = latest.unique_patients || 0;
      const active30d = latest.active_patients_30d || 0;
      const active90d = latest.active_patients_90d || 0;

      return {
        newPatients: latest.new_patients_month || 0,
        returningPatients: totalPatients - latest.new_patients_month || 0,
        retentionRate30d: totalPatients > 0 ? (active30d / totalPatients) * 100 : 0,
        retentionRate60d: totalPatients > 0 ? (active90d / totalPatients) * 100 : 0,
        retentionRate90d: totalPatients > 0 ? (active90d / totalPatients) * 100 : 0,
        inactivePatients: latest.inactive_patients || 0,
        cohorts: aggData.map((d) => ({
          month: new Date(d.month).toLocaleDateString("es-ES", { month: "short", year: "numeric" }),
          new: d.new_patients_month || 0,
          returning: (d.unique_patients || 0) - (d.new_patients_month || 0),
          retained30d: d.active_patients_30d || 0,
        })),
      };
    } catch (error) {
      console.error("[StatisticsService] Error getting patient retention:", error);
      return this.getEmptyRetention();
    }
  }

  // ===========================================================================
  // 2. ENFERMEDADES Y EPIDEMIOLOGÍA
  // ===========================================================================

  /**
   * Obtiene estadísticas de enfermedades y diagnósticos
   */
  async getDiseaseStatistics(dateRange: DateRange): Promise<DiseaseStatistics> {
    try {
      const { data } = await supabase
        .from("mv_doctor_diagnoses_agg")
        .select("*")
        .eq("doctor_id", this.doctorId)
        .gte("week", dateRange.start.toISOString())
        .lte("week", dateRange.end.toISOString());

      const diagnoses = (data as unknown as DiagnosisAggView[]) || [];

      if (!diagnoses || diagnoses.length === 0) {
        return this.getEmptyDiseaseStats();
      }

      // Agrupar diagnósticos
      const diagnosisMap = new Map<string, number>();
      diagnoses.forEach((d) => {
        diagnosisMap.set(d.diagnostico, (diagnosisMap.get(d.diagnostico) || 0) + (d.cases || 0));
      });

      const topDiagnoses = Array.from(diagnosisMap.entries())
        .map(([diagnosis, count]) => ({ diagnosis, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);

      return {
        topDiagnoses,
        icd10Categories: [], // TODO: Implementar categorización ICD-10
        chronicDiseases: [], // TODO: Implementar detección de crónicas
        comorbidities: [],
      };
    } catch (error) {
      console.error("[StatisticsService] Error getting disease statistics:", error);
      return this.getEmptyDiseaseStats();
    }
  }

  // ===========================================================================
  // 3. FINANZAS
  // ===========================================================================

  /**
   * Obtiene métricas financieras
   */
  async getFinancialMetrics(dateRange: DateRange): Promise<FinancialMetrics> {
    try {
      const { data } = await supabase
        .from("mv_doctor_revenue_agg")
        .select("*")
        .eq("doctor_id", this.doctorId)
        .eq("status", "completed")
        .gte("month", dateRange.start.toISOString())
        .lte("month", dateRange.end.toISOString())
        .order("month", { ascending: true });

      const revenueData = (data as unknown as RevenueAggView[]) || [];

      if (!revenueData || revenueData.length === 0) {
        return this.getEmptyFinancialMetrics();
      }

      const totalRevenue = revenueData.reduce((sum, d) => sum + (d.gross_revenue || 0), 0);
      const totalConsultations = revenueData.reduce((sum, d) => sum + (d.consultations || 0), 0);

      // Agrupar por tipo
      const revenueByTypeMap = new Map<string, number>();
      revenueData.forEach((d) => {
        const type = d.consultation_type || "presencial";
        revenueByTypeMap.set(type, (revenueByTypeMap.get(type) || 0) + (d.gross_revenue || 0));
      });

      const revenueByType = Array.from(revenueByTypeMap.entries()).map(([type, amount]) => ({
        type,
        amount,
      }));

      const revenueChart = revenueData.map((d) => ({
        month: new Date(d.month).toLocaleDateString("es-ES", { month: "short" }),
        amount: d.gross_revenue || 0,
      }));

      return {
        totalRevenue,
        previousPeriodRevenue: 0, // TODO: Implementar comparación
        revenueByType,
        revenueByLocation: [], // TODO: Implementar
        avgTicket: totalConsultations > 0 ? totalRevenue / totalConsultations : 0,
        revenueChart,
      };
    } catch (error) {
      console.error("[StatisticsService] Error getting financial metrics:", error);
      return this.getEmptyFinancialMetrics();
    }
  }

  // ===========================================================================
  // 4. PATRONES TEMPORALES
  // ===========================================================================

  /**
   * Obtiene patrones temporales de consultas
   */
  async getTemporalPatterns(dateRange: DateRange): Promise<TemporalPatterns> {
    try {
      const { data } = await supabase
        .from("mv_doctor_temporal_patterns")
        .select("*")
        .eq("doctor_id", this.doctorId)
        .gte("date", dateRange.start.toISOString())
        .lte("date", dateRange.end.toISOString());

      const patterns = (data as unknown as TemporalPatternView[]) || [];

      if (!patterns || patterns.length === 0) {
        return this.getEmptyTemporalPatterns();
      }

      // Distribución horaria
      const hourlyMap = new Map<number, number>();
      patterns.forEach((p) => {
        const hour = p.hour || 0;
        hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + (p.consultations || 0));
      });

      const hourlyDistribution = Array.from(hourlyMap.entries())
        .map(([hour, count]) => ({ hour, count }))
        .sort((a, b) => a.hour - b.hour);

      // Distribución diaria
      const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
      const dailyMap = new Map<string, number>();
      patterns.forEach((p) => {
        // Safe access to dayNames array
        const dayIndex = p.day_of_week || 0;
        const day = dayNames[dayIndex] || "N/A";
        dailyMap.set(day, (dailyMap.get(day) || 0) + (p.consultations || 0));
      });

      const dailyDistribution = Array.from(dailyMap.entries()).map(([day, count]) => ({
        day,
        count,
      }));

      // Heatmap data
      const heatmapMap = new Map<string, number>();
      patterns.forEach((p) => {
        const dayIndex = p.day_of_week || 0;
        const day = dayNames[dayIndex] || "N/A";
        const hour = p.hour || 0;
        const key = `${day}-${hour}`;
        heatmapMap.set(key, (heatmapMap.get(key) || 0) + (p.consultations || 0));
      });

      const heatmapData = Array.from(heatmapMap.entries()).map(([key, count]) => {
        const [day, hour] = key.split("-");
        // Ensure day is a string and hour is a number
        return { day: day || "", hour: parseInt(hour || "0"), count };
      });

      return {
        hourlyDistribution,
        dailyDistribution,
        heatmapData,
      };
    } catch (error) {
      console.error("[StatisticsService] Error getting temporal patterns:", error);
      return this.getEmptyTemporalPatterns();
    }
  }

  // ===========================================================================
  // 5. LABORATORIO
  // ===========================================================================

  /**
   * Obtiene estadísticas de laboratorio
   */
  async getLabStatistics(dateRange: DateRange): Promise<LabStatistics> {
    try {
      const { data } = await supabase
        .from("mv_doctor_lab_agg")
        .select("*")
        .eq("doctor_id", this.doctorId)
        .gte("month", dateRange.start.toISOString())
        .lte("month", dateRange.end.toISOString());

      const labData = (data as unknown as LabAggView[]) || [];

      if (!labData || labData.length === 0) {
        return this.getEmptyLabStatistics();
      }

      const totalOrders = labData.reduce((sum, d) => sum + (d.total_orders || 0), 0);
      const totalAbnormal = labData.reduce((sum, d) => sum + (d.abnormal_results || 0), 0);
      const abnormalityRate = totalOrders > 0 ? (totalAbnormal / totalOrders) * 100 : 0;

      const avgDaysArray = labData.filter((d) => d.avg_days_to_result).map((d) => d.avg_days_to_result);
      const avgDaysToResult =
        avgDaysArray.length > 0
          ? avgDaysArray.reduce((sum, val) => sum + val, 0) / avgDaysArray.length
          : 0;

      const ordersByStatusMap = new Map<string, number>();
      labData.forEach((d) => {
        const status = d.status || "unknown";
        ordersByStatusMap.set(status, (ordersByStatusMap.get(status) || 0) + (d.total_orders || 0));
      });

      const ordersByStatus = Array.from(ordersByStatusMap.entries()).map(([status, count]) => ({
        status,
        count,
      }));

      return {
        topTests: [], // TODO: Implementar desde lab_order_tests
        abnormalityRate,
        avgDaysToResult,
        ordersByStatus,
      };
    } catch (error) {
      console.error("[StatisticsService] Error getting lab statistics:", error);
      return this.getEmptyLabStatistics();
    }
  }

  // ===========================================================================
  // 6. EFICIENCIA
  // ===========================================================================

  /**
   * Obtiene métricas de eficiencia operativa
   */
  async getEfficiencyMetrics(dateRange: DateRange): Promise<EfficiencyMetrics> {
    try {
      const { data } = await supabase
        .from("mv_doctor_efficiency_agg")
        .select("*")
        .eq("doctor_id", this.doctorId)
        .gte("month", dateRange.start.toISOString())
        .lte("month", dateRange.end.toISOString());

      const efficiencyData = (data as unknown as EfficiencyAggView[]) || [];

      if (!efficiencyData || efficiencyData.length === 0) {
        return this.getEmptyEfficiencyMetrics();
      }

      const total = efficiencyData.reduce((sum, d) => sum + (d.total_appointments || 0), 0);
      const completed = efficiencyData.reduce((sum, d) => sum + (d.completed_appointments || 0), 0);
      const cancelled = efficiencyData.reduce((sum, d) => sum + (d.cancelled_appointments || 0), 0);
      const noShow = efficiencyData.reduce((sum, d) => sum + (d.no_show_appointments || 0), 0);

      const avgDurationArray = efficiencyData
        .filter((d) => d.avg_duration)
        .map((d) => d.avg_duration);
      const avgDuration =
        avgDurationArray.length > 0
          ? avgDurationArray.reduce((sum, val) => sum + val, 0) / avgDurationArray.length
          : 0;

      const appointmentsPerDay = efficiencyData.length > 0 ? total / efficiencyData.length : 0;
      const noShowRate = total > 0 ? (noShow / total) * 100 : 0;
      const cancellationRate = total > 0 ? (cancelled / total) * 100 : 0;
      const occupancyRate = total > 0 ? (completed / total) * 100 : 0;

      return {
        appointmentsPerDay,
        avgDuration,
        noShowRate,
        cancellationRate,
        occupancyRate,
      };
    } catch (error) {
      console.error("[StatisticsService] Error getting efficiency metrics:", error);
      return this.getEmptyEfficiencyMetrics();
    }
  }

  // ===========================================================================
  // HELPERS
  // ===========================================================================

  private calculateAge(birthDate: string): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  private getEmptyDemographics(): PatientDemographics {
    return {
      ageGroups: { "0-18": 0, "19-35": 0, "36-50": 0, "51-65": 0, "65+": 0 },
      genderDistribution: { M: 0, F: 0, Other: 0 },
      totalPatients: 0,
      geographicDistribution: { cities: {}, states: {} },
    };
  }

  private getEmptyRetention(): PatientRetention {
    return {
      newPatients: 0,
      returningPatients: 0,
      retentionRate30d: 0,
      retentionRate60d: 0,
      retentionRate90d: 0,
      inactivePatients: 0,
      cohorts: [],
    };
  }

  private getEmptyDiseaseStats(): DiseaseStatistics {
    return {
      topDiagnoses: [],
      icd10Categories: [],
      chronicDiseases: [],
      comorbidities: [],
    };
  }

  private getEmptyFinancialMetrics(): FinancialMetrics {
    return {
      totalRevenue: 0,
      previousPeriodRevenue: 0,
      revenueByType: [],
      revenueByLocation: [],
      avgTicket: 0,
      revenueChart: [],
    };
  }

  private getEmptyTemporalPatterns(): TemporalPatterns {
    return {
      hourlyDistribution: [],
      dailyDistribution: [],
      heatmapData: [],
    };
  }

  private getEmptyLabStatistics(): LabStatistics {
    return {
      topTests: [],
      abnormalityRate: 0,
      avgDaysToResult: 0,
      ordersByStatus: [],
    };
  }

  private getEmptyEfficiencyMetrics(): EfficiencyMetrics {
    return {
      appointmentsPerDay: 0,
      avgDuration: 0,
      noShowRate: 0,
      cancellationRate: 0,
      occupancyRate: 0,
    };
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Crea una instancia del servicio de estadísticas
 */
export function createStatisticsService(doctorId: string): StatisticsService {
  return new StatisticsService(doctorId);
}
