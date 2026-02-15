// ============================================
// MOTHERDUCK ANALYTICS SERVICE
// Advanced medical analytics with DuckDB
// ============================================

/**
 * MotherDuck Service
 *
 * Provides analytics capabilities for Red-Salud using MotherDuck (DuckDB).
 * This service handles:
 * - Querying analytics data
 * - Syncing from Supabase to MotherDuck
 * - Creating and managing Dives (visualizations)
 * - Computing KPIs by specialty
 */

export interface KPIFilters {
  doctorId?: string;
  specialtyId?: string;
  officeId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface KPISet {
  // Patient metrics
  totalPatients?: number;
  newPatientsThisMonth?: number;
  activePatients?: number;

  // Appointment metrics
  totalAppointments?: number;
  completedAppointments?: number;
  noShowRate?: number;
  avgAppointmentsPerDay?: number;

  // Financial metrics
  totalRevenue?: number;
  avgRevenuePerAppointment?: number;
  caseAcceptanceRate?: number;

  // Operational metrics
  avgConsultationDuration?: number;
  patientSatisfactionScore?: number;
}

/**
 * MotherDuck Analytics Service Class
 */
export class MotherDuckService {
  private authToken: string;
  private database?: string;

  constructor(authToken?: string, database?: string) {
    // Try to get token from environment or MCP config
    this.authToken = authToken || process.env.MOTHERDUCK_TOKEN || '';
    this.database = database || process.env.MOTHERDUCK_DATABASE || 'red_salud';
  }

  /**
   * Execute a SQL query against MotherDuck
   */
  async query(sql: string, params: unknown[] = []): Promise<unknown[]> {
    try {
      // Note: MotherDuck API integration would go here
      // For now, return empty array to avoid errors
      console.log('[MotherDuck] Query:', sql, params);
      return [];
    } catch (error) {
      console.error('[MotherDuck] Query error:', error);
      throw error;
    }
  }

  /**
   * Get no-show rate for a doctor
   */
  async getNoShowRate(filters: KPIFilters): Promise<number> {
    const sql = `
      SELECT
        COUNT(*) FILTER (WHERE status = 'no_asistio')::FLOAT / COUNT(*) as no_show_rate
      FROM analytics_appointments
      WHERE 1=1
        ${filters.doctorId ? `AND doctor_id = '${filters.doctorId}'` : ''}
        ${filters.specialtyId ? `AND specialty_id = '${filters.specialtyId}'` : ''}
        ${filters.dateFrom ? `AND fecha_hora >= '${filters.dateFrom}'` : ''}
        ${filters.dateTo ? `AND fecha_hora <= '${filters.dateTo}'` : ''}
    `;

    const result = await this.query(sql) as any[];
    return result[0]?.no_show_rate || 0;
  }

  /**
   * Get case acceptance rate for dental specialties
   */
  async getCaseAcceptanceRate(filters: KPIFilters): Promise<number> {
    const sql = `
      SELECT
        COUNT(*) FILTER (WHERE status = 'accepted')::FLOAT / COUNT(*) as acceptance_rate
      FROM analytics_treatment_plans
      WHERE 1=1
        ${filters.doctorId ? `AND doctor_id = '${filters.doctorId}'` : ''}
        ${filters.dateFrom ? `AND created_at >= '${filters.dateFrom}'` : ''}
        ${filters.dateTo ? `AND created_at <= '${filters.dateTo}'` : ''}
    `;

    const result = await this.query(sql) as any[];
    return result[0]?.acceptance_rate || 0;
  }

  /**
   * Get production/revenue metrics
   */
  async getProductionMetrics(filters: KPIFilters): Promise<{
    daily: number;
    weekly: number;
    monthly: number;
    avgTicket: number;
  }> {
    const sql = `
      WITH daily_production AS (
        SELECT
          DATE(fecha_hora) as date,
          SUM(estimado_costo) as production
        FROM analytics_appointments a
        LEFT JOIN analytics_treatment_plans tp ON tp.appointment_id = a.id
        WHERE 1=1
          ${filters.doctorId ? `AND a.doctor_id = '${filters.doctorId}'` : ''}
          ${filters.dateFrom ? `AND a.fecha_hora >= '${filters.dateFrom}'` : ''}
          ${filters.dateTo ? `AND a.fecha_hora <= '${filters.dateTo}'` : ''}
        GROUP BY DATE(fecha_hora)
      )
      SELECT
        COALESCE(SUM(CASE WHEN date >= CURRENT_DATE THEN production END), 0) as daily,
        COALESCE(SUM(CASE WHEN date >= CURRENT_DATE - INTERVAL 7 DAY THEN production END), 0) as weekly,
        COALESCE(SUM(production), 0) as monthly,
        COALESCE(AVG(production), 0) as avg_ticket
      FROM daily_production
    `;

    const result = await this.query(sql) as any[];
    const row = result[0] || {};

    return {
      daily: row.daily || 0,
      weekly: row.weekly || 0,
      monthly: row.monthly || 0,
      avgTicket: row.avg_ticket || 0,
    };
  }

  /**
   * Get complete KPI set for a doctor
   */
  async getDoctorKPIs(filters: KPIFilters): Promise<KPISet> {
    const [
      noShowRate,
      caseAcceptanceRate,
      production,
      appointments,
    ] = await Promise.all([
      this.getNoShowRate(filters),
      this.getCaseAcceptanceRate(filters),
      this.getProductionMetrics(filters),
      this.getAppointmentsStats(filters),
    ]);

    return {
      ...appointments,
      noShowRate: Math.round(noShowRate * 100) / 100,
      caseAcceptanceRate: Math.round(caseAcceptanceRate * 100) / 100,
      totalRevenue: production.monthly,
      avgRevenuePerAppointment: production.avgTicket,
    };
  }

  /**
   * Get appointment statistics
   */
  private async getAppointmentsStats(filters: KPIFilters): Promise<{
    totalAppointments: number;
    completedAppointments: number;
    avgAppointmentsPerDay: number;
  }> {
    const sql = `
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'completada') as completed,
        COUNT(DISTINCT DATE(fecha_hora)) as active_days
      FROM analytics_appointments
      WHERE 1=1
        ${filters.doctorId ? `AND doctor_id = '${filters.doctorId}'` : ''}
        ${filters.dateFrom ? `AND fecha_hora >= '${filters.dateFrom}'` : ''}
        ${filters.dateTo ? `AND fecha_hora <= '${filters.dateTo}'` : ''}
    `;

    const result = await this.query(sql) as any[];
    const row = result[0] || {};

    return {
      totalAppointments: row.total || 0,
      completedAppointments: row.completed || 0,
      avgAppointmentsPerDay: row.active_days > 0
        ? Math.round((row.total || 0) / row.active_days * 10) / 10
        : 0,
    };
  }

  /**
   * Sync appointments from Supabase to MotherDuck
   * This should be called periodically (webhook or cron)
   */
  async syncAppointments(appointments: any[]): Promise<void> {
    if (appointments.length === 0) return;

    const sql = `
      INSERT OR REPLACE INTO analytics_appointments
      SELECT
        id,
        doctor_id,
        paciente_id,
        paciente_nombre,
        fecha_hora,
        fecha_hora_fin,
        duracion_minutos,
        motivo,
        status,
        tipo_cita,
        created_at,
        updated_at,
        ${this.database}.current_timestamp() as synced_at
      FROM VALUES (${appointments.map(() => '?').join(',')})
    `;

    await this.query(sql, appointments.flat());
  }

  /**
   * Create a Dive (interactive visualization)
   */
  async createDive(params: {
    title: string;
    description: string;
    content: string; // React/JSX content
  }): Promise<{ url: string; id: string }> {
    try {
      // Using MCP to save dive
      // const { mcp__motherduck__save_dive } = await import('@modelcontextprotocol/server/parent');

      // const dive = await mcp__motherduck__save_dive({
      //   title: params.title,
      //   description: params.description,
      //   content: params.content,
      // });

      console.log('[MotherDuck] Would save dive:', params);
      return {
        url: 'mock-url',
        id: 'mock-dive'
      };
    } catch (error) {
      console.error('[MotherDuck] Failed to create dive:', error);
      throw error;
    }
  }

  /**
   * List available databases
   */
  async listDatabases(): Promise<string[]> {
    try {
      // const { mcp__motherduck__list_databases } = await import('@modelcontextprotocol/server/parent');
      // const databases = await mcp__motherduck__list_databases();

      console.log('[MotherDuck] Would list databases');
      return ['mock_database_1', 'mock_database_2'];
    } catch (error) {
      console.error('[MotherDuck] Failed to list databases:', error);
      return [];
    }
  }

  /**
   * Get summary statistics for a table
   */
  async getTableStats(tableName: string): Promise<any> {
    const sql = `
      SELECT
        COUNT(*) as row_count,
        MIN(created_at) as earliest_record,
        MAX(created_at) as latest_record
      FROM ${tableName}
    `;

    const result = await this.query(sql);
    return result[0];
  }

  /**
   * Test the connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const result = await this.query('SELECT 1 as test');
      return result[0] !== undefined;
    } catch {
      return false;
    }
  }
}

// Singleton instance
let serviceInstance: MotherDuckService | null = null;

/**
 * Get the MotherDuck service singleton
 */
export function getMotherDuckService(): MotherDuckService {
  if (!serviceInstance) {
    serviceInstance = new MotherDuckService();
  }
  return serviceInstance;
}

/**
 * Initialize MotherDuck tables and views
 */
export async function initializeMotherDuckSchema(): Promise<void> {
  const service = getMotherDuckService();

  // Create analytics tables if they don't exist
  const createTablesSQL = `
    -- Appointments analytics table
    CREATE OR REPLACE TABLE analytics_appointments AS (
      SELECT * FROM READ_PARQUETS('supabase://*.appointments')
    );

    -- Treatment plans analytics table
    CREATE OR REPLACE TABLE analytics_treatment_plans AS (
      SELECT * FROM READ_PARQUETS('supabase://*.treatment_plans')
    );

    -- Doctors view
    CREATE OR REPLACE VIEW vw_doctor_metrics AS
    SELECT
      doctor_id,
      COUNT(*) as total_appointments,
      COUNT(*) FILTER (WHERE status = 'completada') as completed_appointments,
      COUNT(*) FILTER (WHERE status = 'no_asistio') as no_shows,
      COUNT(DISTINCT paciente_id) as unique_patients
    FROM analytics_appointments
    GROUP BY doctor_id;

    -- Daily production view
    CREATE OR REPLACE VIEW vw_daily_production AS
    SELECT
      doctor_id,
      DATE(fecha_hora) as date,
      COUNT(*) as appointments,
      SUM(estimado_costo) as production
    FROM analytics_appointments
    GROUP BY doctor_id, DATE(fecha_hora);
  `;

  // Execute initialization
  await service.query(createTablesSQL);
}

/**
 * React hook for MotherDuck queries
 */
export function useMotherDuck() {
  const service = getMotherDuckService();

  return {
    getDoctorKPIs: (filters: KPIFilters) => service.getDoctorKPIs(filters),
    getNoShowRate: (filters: KPIFilters) => service.getNoShowRate(filters),
    getCaseAcceptanceRate: (filters: KPIFilters) => service.getCaseAcceptanceRate(filters),
    getProductionMetrics: (filters: KPIFilters) => service.getProductionMetrics(filters),
    syncAppointments: (appointments: any[]) => service.syncAppointments(appointments),
    createDive: (params: { title: string; description: string; content: string }) =>
      service.createDive(params),
    testConnection: () => service.testConnection(),
  };
}
