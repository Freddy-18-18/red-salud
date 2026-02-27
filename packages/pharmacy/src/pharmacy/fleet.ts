import { v4 as uuidv4 } from 'uuid';
import {
  Vehicle,
  Driver,
  MaintenanceRecord,
} from '@red-salud/types';

export class FleetManager {
  private vehicles: Vehicle[] = [];
  private drivers: Driver[] = [];
  private maintenanceRecords: MaintenanceRecord[] = [];

  constructor() {
    this.loadVehicles();
    this.loadDrivers();
    this.loadMaintenanceRecords();
  }

  async loadVehicles(): Promise<void> {
    const stored = localStorage.getItem('fleet_vehicles');
    if (stored) {
      this.vehicles = JSON.parse(stored) as Vehicle[];
    }
  }

  async saveVehicles(): Promise<void> {
    localStorage.setItem('fleet_vehicles', JSON.stringify(this.vehicles));
  }

  async loadDrivers(): Promise<void> {
    const stored = localStorage.getItem('fleet_drivers');
    if (stored) {
      this.drivers = JSON.parse(stored) as Driver[];
    }
  }

  async saveDrivers(): Promise<void> {
    localStorage.setItem('fleet_drivers', JSON.stringify(this.drivers));
  }

  async loadMaintenanceRecords(): Promise<void> {
    const stored = localStorage.getItem('maintenance_records');
    if (stored) {
      this.maintenanceRecords = JSON.parse(stored) as MaintenanceRecord[];
    }
  }

  async saveMaintenanceRecords(): Promise<void> {
    localStorage.setItem('maintenance_records', JSON.stringify(this.maintenanceRecords));
  }

  async createVehicle(vehicle: Omit<Vehicle, 'id' | 'created_at'>): Promise<Vehicle> {
    const newVehicle: Vehicle = {
      ...vehicle,
      id: uuidv4(),
      created_at: new Date(),
    };

    this.vehicles.push(newVehicle);
    await this.saveVehicles();

    return newVehicle;
  }

  async createDriver(driver: Omit<Driver, 'id' | 'created_at'>): Promise<Driver> {
    const newDriver: Driver = {
      ...driver,
      id: uuidv4(),
      created_at: new Date(),
    };

    this.drivers.push(newDriver);
    await this.saveDrivers();

    return newDriver;
  }

  async createMaintenanceRecord(record: Omit<MaintenanceRecord, 'id' | 'created_at'>): Promise<MaintenanceRecord> {
    const newRecord: MaintenanceRecord = {
      ...record,
      id: uuidv4(),
      created_at: new Date(),
    };

    this.maintenanceRecords.push(newRecord);
    await this.saveMaintenanceRecords();

    return newRecord;
  }

  getVehicles(status?: Vehicle['status']): Vehicle[] {
    let vehicles = [...this.vehicles];

    if (status) {
      vehicles = vehicles.filter((v) => v.status === status);
    }

    return vehicles.sort((a, b) => b.year - a.year);
  }

  getVehicle(vehicleId: string): Vehicle | undefined {
    return this.vehicles.find((v) => v.id === vehicleId);
  }

  getDrivers(isActive?: boolean): Driver[] {
    let drivers = [...this.drivers];

    if (isActive !== undefined) {
      drivers = drivers.filter((d) => d.is_active === isActive);
    }

    return drivers.sort((a, b) => a.name.localeCompare(b.name));
  }

  getDriver(driverId: string): Driver | undefined {
    return this.drivers.find((d) => d.id === driverId);
  }

  getMaintenanceRecords(vehicleId?: string): MaintenanceRecord[] {
    let records = [...this.maintenanceRecords];

    if (vehicleId) {
      records = records.filter((r) => r.vehicle_id === vehicleId);
    }

    return records.sort((a, b) => b.performed_at.getTime() - a.performed_at.getTime());
  }
}
