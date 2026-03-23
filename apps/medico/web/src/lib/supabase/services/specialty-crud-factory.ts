// TODO: Implement specialty CRUD factory
// This is a stub to allow the app to compile.

export interface FilterOptions {
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
  search?: string;
}

export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface SpecialtyCrudService<T = Record<string, unknown>> {
  list(doctorId: string, filters?: FilterOptions): Promise<ServiceResult<T[]>>;
  count(doctorId: string, filters?: FilterOptions): Promise<ServiceResult<number>>;
  getById(id: string): Promise<ServiceResult<T>>;
  create(doctorId: string, data: Partial<T>): Promise<ServiceResult<T>>;
  update(id: string, doctorId: string, data: Partial<T>): Promise<ServiceResult<T>>;
  delete(id: string): Promise<ServiceResult<void>>;
  remove(id: string, doctorId: string): Promise<ServiceResult<void>>;
}
