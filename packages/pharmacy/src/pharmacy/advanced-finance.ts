import { v4 as uuidv4 } from 'uuid';
import {
  FinancialProjection,
  KPI,
} from '@red-salud/types';

export class AdvancedFinanceManager {
  private projections: FinancialProjection[] = [];
  private kpis: KPI[] = [];

  constructor() {
    this.loadProjections();
    this.loadKPIs();
  }

  async loadProjections(): Promise<void> {
    const stored = localStorage.getItem('financial_projections');
    if (stored) {
      this.projections = JSON.parse(stored) as FinancialProjection[];
    }
  }

  async saveProjections(): Promise<void> {
    localStorage.setItem('financial_projections', JSON.stringify(this.projections));
  }

  async loadKPIs(): Promise<void> {
    const stored = localStorage.getItem('financial_kpis');
    if (stored) {
      this.kpis = JSON.parse(stored) as KPI[];
    }
  }

  async saveKPIs(): Promise<void> {
    localStorage.setItem('financial_kpis', JSON.stringify(this.kpis));
  }

  async createProjection(projection: Omit<FinancialProjection, 'id' | 'created_at'>): Promise<FinancialProjection> {
    const newProjection: FinancialProjection = {
      ...projection,
      id: uuidv4(),
      created_at: new Date(),
    };

    this.projections.push(newProjection);
    await this.saveProjections();

    return newProjection;
  }

  async createKPI(kpi: Omit<KPI, 'id' | 'created_at'>): Promise<KPI> {
    const newKPI: KPI = {
      ...kpi,
      id: uuidv4(),
      created_at: new Date(),
    };

    this.kpis.push(newKPI);
    await this.saveKPIs();

    return newKPI;
  }

  getProjections(warehouseId?: string): FinancialProjection[] {
    let projections = [...this.projections];

    if (warehouseId) {
      projections = projections.filter((p) => p.created_by === warehouseId);
    }

    return projections.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  }

  getKPIs(warehouseId?: string): KPI[] {
    let kpis = [...this.kpis];

    if (warehouseId) {
      kpis = kpis.filter((k) => k.warehouse_id === warehouseId);
    }

    return kpis.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  }

  getKPI(kpiId: string): KPI | undefined {
    return this.kpis.find((k) => k.id === kpiId);
  }
}
