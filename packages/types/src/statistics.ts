export interface StatisticsData {
    totalPatients: number;
    totalAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    revenue: number;
    averageRating: number;
}

export interface ChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        backgroundColor?: string | string[];
        borderColor?: string | string[];
        borderWidth?: number;
    }[];
}

export interface TimeSeriesData {
    date: string;
    value: number;
}

export interface StatisticsFilters {
    startDate?: Date;
    endDate?: Date;
    officeId?: string;
    specialty?: string;
}

// Tipos para tabs de estadísticas
export type EstadisticaTab =
    | 'resumen'
    | 'pacientes'
    | 'citas'
    | 'ingresos'
    | 'enfermedades'
    | 'consultorios'
    | 'patrones'
    | 'eficiencia'
    | 'laboratorio'
    | 'medicamentos'
    | 'telemedicina'
    | 'salud';

export interface EstadisticaTabMeta {
    id: EstadisticaTab;
    label: string;
    icon?: string;
    description?: string;
}

// Tipos para rangos de fechas
export interface DateRange {
    from: Date;
    to: Date;
}

export type DateRangePreset =
    | 'today'
    | 'yesterday'
    | 'last7days'
    | 'last30days'
    | 'thisMonth'
    | 'lastMonth'
    | 'thisYear'
    | 'custom';
