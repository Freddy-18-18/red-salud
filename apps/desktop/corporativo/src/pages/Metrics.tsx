import React, { useState, useEffect, useCallback } from 'react';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import {
    TrendingUp,
    TrendingDown,
    Users,
    Building2,
    Stethoscope,
    ArrowUpRight,
    ArrowDownRight,
    RefreshCw,
    Download,
    CheckCircle2,
    AlertCircle,
    Briefcase,
    Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
    getCorporateKPIs,
    getGrowthHistory,
    getRoleDistribution,
    getRegistrationComparison,
    getPharmacyNetworkStats,
    exportToCSV,
    type CorporateKPIs,
    type GrowthDataPoint,
    type RoleDistribution,
    type DateRange
} from '@/services/analytics.service';

// ============================================
// METRIC CARD COMPONENT
// ============================================

interface MetricCardProps {
    label: string;
    value: string | number;
    trend?: 'up' | 'down' | 'stable';
    trendValue?: string;
    icon: React.ElementType;
    loading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
    label,
    value,
    trend,
    trendValue,
    icon: Icon,
    loading
}) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="stat-card group"
    >
        <div className="flex items-start justify-between mb-4">
            <div className="p-2.5 rounded-xl bg-[#0071e3]/10 text-[#0071e3] group-hover:bg-[#0071e3]/15 transition-colors">
                <Icon className="h-5 w-5" strokeWidth={1.5} />
            </div>
            {trend && trendValue && (
                <span className={`text-xs font-medium flex items-center gap-1 ${trend === 'up' ? 'text-[#30d158]' :
                        trend === 'down' ? 'text-[#ff453a]' :
                            'text-[#86868b]'
                    }`}>
                    {trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> :
                        trend === 'down' ? <ArrowDownRight className="h-3 w-3" /> : null}
                    {trendValue}
                </span>
            )}
        </div>

        <p className="text-overline mb-1">{label}</p>
        {loading ? (
            <div className="h-8 w-16 bg-white/5 rounded-lg animate-pulse" />
        ) : (
            <p className="text-2xl font-semibold text-white">{value}</p>
        )}
    </motion.div>
);

// ============================================
// PERIOD SELECTOR
// ============================================

interface PeriodSelectorProps {
    selected: DateRange;
    onChange: (range: DateRange) => void;
}

const PeriodSelector: React.FC<PeriodSelectorProps> = ({ selected, onChange }) => {
    const options: { value: DateRange; label: string }[] = [
        { value: '7d', label: '7D' },
        { value: '30d', label: '30D' },
        { value: '90d', label: '90D' },
        { value: '6m', label: '6M' }
    ];

    return (
        <div className="flex bg-white/[0.04] p-1 rounded-xl">
            {options.map(opt => (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selected === opt.value
                            ? 'bg-[#0071e3] text-white'
                            : 'text-[#86868b] hover:text-white'
                        }`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
};

// ============================================
// MAIN PAGE
// ============================================

const MetricsPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<DateRange>('30d');
    const [kpis, setKpis] = useState<CorporateKPIs | null>(null);
    const [growthData, setGrowthData] = useState<GrowthDataPoint[]>([]);
    const [roleDistribution, setRoleDistribution] = useState<RoleDistribution[]>([]);
    const [comparison, setComparison] = useState<{ current: number; previous: number; change: number; changePercent: number } | null>(null);
    const [pharmacyStats, setPharmacyStats] = useState<any>(null);

    const fetchAllData = useCallback(async () => {
        setLoading(true);
        try {
            const [kpisData, growthHistory, roles, comparisonData, pharmaStats] = await Promise.all([
                getCorporateKPIs(),
                getGrowthHistory(6),
                getRoleDistribution(),
                getRegistrationComparison(period),
                getPharmacyNetworkStats()
            ]);

            setKpis(kpisData);
            setGrowthData(growthHistory);
            setRoleDistribution(roles);
            setComparison(comparisonData);
            setPharmacyStats(pharmaStats);
        } catch (error) {
            console.error('[MetricsPage] Error:', error);
            toast.error('Error al cargar métricas');
        } finally {
            setLoading(false);
        }
    }, [period]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    const handleExport = () => {
        if (growthData.length > 0) {
            exportToCSV(growthData, 'growth_metrics');
            toast.success('Datos exportados');
        }
    };

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto pb-16">
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-end justify-between gap-6"
            >
                <div className="space-y-2">
                    <p className="text-overline">Analytics</p>
                    <h1 className="text-display text-white">Métricas</h1>
                    <p className="text-body text-[#86868b] max-w-lg">
                        Análisis en tiempo real del crecimiento de la red Red-Salud.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <PeriodSelector selected={period} onChange={setPeriod} />

                    <button
                        onClick={handleExport}
                        className="apple-button-secondary h-10 w-10 !p-0 rounded-xl flex items-center justify-center"
                        title="Exportar CSV"
                    >
                        <Download className="h-4 w-4" strokeWidth={1.5} />
                    </button>

                    <button
                        onClick={fetchAllData}
                        disabled={loading}
                        className="apple-button h-10 w-10 !p-0 rounded-xl flex items-center justify-center"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} strokeWidth={1.5} />
                    </button>
                </div>
            </motion.header>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <MetricCard
                    label="Crecimiento"
                    value={`${kpis?.growthRate || 0}%`}
                    trend={kpis?.growthTrend}
                    trendValue="vs mes anterior"
                    icon={TrendingUp}
                    loading={loading}
                />
                <MetricCard
                    label="Médicos"
                    value={kpis?.doctors?.toLocaleString() || '0'}
                    trend="up"
                    icon={Stethoscope}
                    loading={loading}
                />
                <MetricCard
                    label="Farmacias"
                    value={kpis?.pharmacies?.toLocaleString() || '0'}
                    trend="up"
                    trendValue={`${pharmacyStats?.verificationRate || 0}% verif.`}
                    icon={Building2}
                    loading={loading}
                />
                <MetricCard
                    label="Pacientes"
                    value={kpis?.patients?.toLocaleString() || '0'}
                    icon={Users}
                    loading={loading}
                />
                <MetricCard
                    label="Tickets"
                    value={kpis?.pendingTickets || 0}
                    trend={kpis?.pendingTickets ? 'down' : 'stable'}
                    trendValue={kpis?.pendingTickets ? 'pendientes' : 'ok'}
                    icon={kpis?.pendingTickets ? AlertCircle : CheckCircle2}
                    loading={loading}
                />
                <MetricCard
                    label="Equipo"
                    value={kpis?.corporateUsers || 0}
                    icon={Briefcase}
                    loading={loading}
                />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Growth Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-2 apple-card p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-title text-white">Crecimiento de la Red</h3>
                            <p className="text-caption mt-1">Últimos 6 meses</p>
                        </div>
                        <Activity className="h-5 w-5 text-[#0071e3]" strokeWidth={1.5} />
                    </div>

                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={growthData}>
                                <defs>
                                    <linearGradient id="gradDoctors" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0071e3" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#0071e3" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gradPharmacies" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#5e5ce6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#5e5ce6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gradPatients" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#30d158" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#30d158" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    stroke="#6e6e73"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#6e6e73"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    width={35}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1c1c1e',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        fontSize: '12px',
                                        color: '#f5f5f7'
                                    }}
                                />
                                <Area type="monotone" dataKey="doctors" name="Médicos" stroke="#0071e3" strokeWidth={2} fillOpacity={1} fill="url(#gradDoctors)" />
                                <Area type="monotone" dataKey="pharmacies" name="Farmacias" stroke="#5e5ce6" strokeWidth={2} fillOpacity={1} fill="url(#gradPharmacies)" />
                                <Area type="monotone" dataKey="patients" name="Pacientes" stroke="#30d158" strokeWidth={2} fillOpacity={1} fill="url(#gradPatients)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center justify-center gap-6 mt-4">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#0071e3]" />
                            <span className="text-xs text-[#86868b]">Médicos</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#5e5ce6]" />
                            <span className="text-xs text-[#86868b]">Farmacias</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#30d158]" />
                            <span className="text-xs text-[#86868b]">Pacientes</span>
                        </div>
                    </div>
                </motion.div>

                {/* Role Distribution */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="apple-card p-6"
                >
                    <div className="mb-6">
                        <h3 className="text-title text-white">Distribución</h3>
                        <p className="text-caption mt-1">Por tipo de usuario</p>
                    </div>

                    <div className="h-[180px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={roleDistribution.slice(0, 5)}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={45}
                                    outerRadius={70}
                                    paddingAngle={3}
                                    dataKey="count"
                                    nameKey="role"
                                >
                                    {roleDistribution.slice(0, 5).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1c1c1e',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        fontSize: '11px',
                                        color: '#f5f5f7'
                                    }}
                                    formatter={(value: number, name: string) => [`${value}`, name]}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Legend */}
                    <div className="space-y-2 mt-4">
                        {roleDistribution.slice(0, 4).map((role, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: role.color }} />
                                    <span className="text-xs text-[#86868b] capitalize">{role.role}</span>
                                </div>
                                <span className="text-xs text-white font-medium">{role.percentage}%</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pharmacy Verification */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="apple-card p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-title text-white">Red de Farmacias</h3>
                            <p className="text-caption mt-1">Estado de verificación SACS</p>
                        </div>
                        <Building2 className="h-5 w-5 text-[#5e5ce6]" strokeWidth={1.5} />
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="text-center p-4 rounded-xl bg-[#30d158]/10">
                            <p className="text-xl font-semibold text-[#30d158]">{pharmacyStats?.verified || 0}</p>
                            <p className="text-[10px] text-[#86868b] mt-1">Verificadas</p>
                        </div>
                        <div className="text-center p-4 rounded-xl bg-[#ffd60a]/10">
                            <p className="text-xl font-semibold text-[#ffd60a]">{pharmacyStats?.pending || 0}</p>
                            <p className="text-[10px] text-[#86868b] mt-1">Pendientes</p>
                        </div>
                        <div className="text-center p-4 rounded-xl bg-[#0071e3]/10">
                            <p className="text-xl font-semibold text-[#0071e3]">{pharmacyStats?.verificationRate || 0}%</p>
                            <p className="text-[10px] text-[#86868b] mt-1">Tasa</p>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[#30d158] rounded-full transition-all duration-1000"
                            style={{ width: `${pharmacyStats?.verificationRate || 0}%` }}
                        />
                    </div>
                </motion.div>

                {/* New Registrations */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="apple-card p-6 bg-gradient-to-br from-[#0071e3]/5 to-[#5e5ce6]/5"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-title text-white">Nuevos Registros</h3>
                            <p className="text-caption mt-1">Comparación con período anterior</p>
                        </div>
                        {comparison?.change && comparison.change > 0 ? (
                            <TrendingUp className="h-5 w-5 text-[#30d158]" strokeWidth={1.5} />
                        ) : (
                            <TrendingDown className="h-5 w-5 text-[#ff453a]" strokeWidth={1.5} />
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-6">
                        <div>
                            <p className="text-caption mb-1">Período Actual</p>
                            <p className="text-3xl font-semibold text-white">{comparison?.current || 0}</p>
                        </div>
                        <div>
                            <p className="text-caption mb-1">Período Anterior</p>
                            <p className="text-3xl font-semibold text-[#6e6e73]">{comparison?.previous || 0}</p>
                        </div>
                    </div>

                    <div className={`flex items-center gap-2 ${comparison?.change && comparison.change > 0 ? 'text-[#30d158]' : 'text-[#ff453a]'
                        }`}>
                        {comparison?.change && comparison.change > 0 ? (
                            <ArrowUpRight className="h-5 w-5" />
                        ) : (
                            <ArrowDownRight className="h-5 w-5" />
                        )}
                        <span className="text-xl font-semibold">
                            {comparison?.change && comparison.change > 0 ? '+' : ''}{comparison?.change || 0}
                        </span>
                        <span className="text-sm opacity-70">
                            ({comparison?.changePercent || 0}%)
                        </span>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default MetricsPage;
