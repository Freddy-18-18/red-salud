import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    Building2,
    Activity,
    Stethoscope,
    ChevronRight,
    Bell,
    RefreshCw,
    ArrowUpRight,
    Clock,
    CheckCircle2,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { getDashboardStats, type DashboardStats } from '@/services/supabase.queries';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// ============================================
// APPLE-STYLE STAT CARD COMPONENT
// ============================================

interface StatCardProps {
    label: string;
    value: string | number;
    icon: React.ElementType;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
    loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
    label,
    value,
    icon: Icon,
    change,
    changeType = 'neutral',
    loading = false
}) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="stat-card group cursor-pointer"
    >
        <div className="flex items-start justify-between mb-4">
            <div className="p-2.5 rounded-xl bg-[#0071e3]/10 text-[#0071e3] group-hover:bg-[#0071e3]/15 transition-colors">
                <Icon className="h-5 w-5" strokeWidth={1.5} />
            </div>
            {change && (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${changeType === 'positive' ? 'text-[#30d158] bg-[#30d158]/10' :
                        changeType === 'negative' ? 'text-[#ff453a] bg-[#ff453a]/10' :
                            'text-[#86868b] bg-white/5'
                    }`}>
                    {change}
                </span>
            )}
        </div>

        <div className="space-y-1">
            <p className="text-overline">{label}</p>
            {loading ? (
                <div className="h-9 w-20 bg-white/5 rounded-lg animate-pulse" />
            ) : (
                <p className="text-3xl font-semibold text-white tracking-tight">{value}</p>
            )}
        </div>
    </motion.div>
);

// ============================================
// TICKET ITEM COMPONENT
// ============================================

interface TicketItemProps {
    ticket: any;
    index: number;
}

const TicketItem: React.FC<TicketItemProps> = ({ ticket, index }) => (
    <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/[0.03] transition-colors cursor-pointer group"
    >
        <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-[#86868b] group-hover:text-[#0071e3] transition-colors">
            <Building2 className="h-4 w-4" strokeWidth={1.5} />
        </div>

        <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate group-hover:text-[#0071e3] transition-colors">
                {(ticket.metadata as any)?.pharmacyName || ticket.subject || 'Nueva Solicitud'}
            </p>
            <p className="text-xs text-[#86868b] truncate">
                {(ticket.metadata as any)?.state || 'Sede Central'} • #{ticket.id.slice(0, 6).toUpperCase()}
            </p>
        </div>

        <div className="flex items-center gap-3">
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${ticket.status === 'open'
                    ? 'bg-[#ffd60a]/10 text-[#ffd60a]'
                    : 'bg-[#30d158]/10 text-[#30d158]'
                }`}>
                {ticket.status === 'open' ? 'Pendiente' : 'Resuelto'}
            </span>
            <ChevronRight className="h-4 w-4 text-[#6e6e73] group-hover:text-[#86868b] transition-colors" />
        </div>
    </motion.div>
);

// ============================================
// ANNOUNCEMENT COMPONENT
// ============================================

interface AnnouncementProps {
    announcement: any;
}

const AnnouncementCard: React.FC<AnnouncementProps> = ({ announcement }) => (
    <div className="p-4 rounded-xl bg-[#0071e3]/5 border border-[#0071e3]/10 hover:bg-[#0071e3]/8 transition-colors cursor-pointer">
        <div className="flex items-start gap-3">
            <Bell className="h-4 w-4 text-[#0071e3] mt-0.5 flex-shrink-0" strokeWidth={1.5} />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white mb-1 line-clamp-1">{announcement.title}</p>
                <p className="text-xs text-[#86868b] line-clamp-2">{announcement.content}</p>
            </div>
        </div>
    </div>
);

// ============================================
// MAIN DASHBOARD
// ============================================

const DashboardPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats>({
        poblacion: 0,
        farmacias: 0,
        doctores: 0,
        tickets: 0,
        security: 'SECURE'
    });
    const [recentTickets, setRecentTickets] = useState<any[]>([]);
    const [announcements, setAnnouncements] = useState<any[]>([]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const dashboardStats = await getDashboardStats();
            setStats(dashboardStats);

            const [ticketsRes, announcementsRes] = await Promise.all([
                supabase.from('support_tickets').select('*').order('created_at', { ascending: false }).limit(5),
                supabase.from('system_announcements').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(3)
            ]);

            setRecentTickets(ticketsRes.data || []);
            setAnnouncements(announcementsRes.data || []);
        } catch (error) {
            console.error('[Dashboard] Error:', error);
            toast.error('Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const currentTime = new Date();

    return (
        <div className="space-y-8 pb-16 max-w-[1600px] mx-auto">
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-end justify-between gap-6"
            >
                <div className="space-y-2">
                    <p className="text-overline">Centro de Comando</p>
                    <h1 className="text-display text-white">Dashboard</h1>
                    <p className="text-body text-[#86868b] max-w-md">
                        Resumen general de la red Red-Salud. Monitoreo en tiempo real.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Status indicator */}
                    <div className="apple-glass rounded-full px-4 py-2 flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-[#30d158] animate-pulse-soft" />
                            <span className="text-xs font-medium text-white">Sistemas activos</span>
                        </div>
                        <div className="h-4 w-px bg-white/10" />
                        <div className="flex items-center gap-2 text-[#86868b]">
                            <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
                            <span className="text-xs font-medium">
                                {currentTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>

                    {/* Refresh button */}
                    <button
                        onClick={fetchDashboardData}
                        disabled={loading}
                        className="apple-button-secondary h-10 w-10 !p-0 rounded-full flex items-center justify-center"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} strokeWidth={1.5} />
                    </button>
                </div>
            </motion.header>

            {/* Stats Grid */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
                <StatCard
                    label="Usuarios Totales"
                    value={stats.poblacion.toLocaleString()}
                    icon={Users}
                    change="+12%"
                    changeType="positive"
                    loading={loading}
                />
                <StatCard
                    label="Médicos"
                    value={stats.doctores}
                    icon={Stethoscope}
                    change="Activos"
                    changeType="neutral"
                    loading={loading}
                />
                <StatCard
                    label="Farmacias"
                    value={stats.farmacias}
                    icon={Building2}
                    change="Red"
                    changeType="neutral"
                    loading={loading}
                />
                <StatCard
                    label="Tickets"
                    value={stats.tickets}
                    icon={Activity}
                    change={stats.tickets > 0 ? 'Pendientes' : 'Sin pendientes'}
                    changeType={stats.tickets > 0 ? 'negative' : 'positive'}
                    loading={loading}
                />
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Tickets Panel */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2 apple-card p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-title text-white">Solicitudes Recientes</h2>
                            <p className="text-caption mt-1">Últimas solicitudes de la red</p>
                        </div>
                        <button
                            onClick={() => window.location.href = '/pharmacies'}
                            className="apple-button-secondary text-xs !py-2 !px-4 flex items-center gap-2"
                        >
                            Ver todas
                            <ArrowUpRight className="h-3.5 w-3.5" />
                        </button>
                    </div>

                    <div className="space-y-1">
                        {loading ? (
                            [...Array(3)].map((_, i) => (
                                <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
                            ))
                        ) : recentTickets.length === 0 ? (
                            <div className="py-12 text-center">
                                <CheckCircle2 className="h-10 w-10 text-[#30d158] mx-auto mb-3" strokeWidth={1.5} />
                                <p className="text-sm text-[#86868b]">Sin solicitudes pendientes</p>
                            </div>
                        ) : (
                            recentTickets.map((ticket, i) => (
                                <TicketItem key={ticket.id} ticket={ticket} index={i} />
                            ))
                        )}
                    </div>
                </motion.div>

                {/* Sidebar - Announcements & Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-6"
                >
                    {/* Announcements */}
                    <div className="apple-card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-title text-white">Avisos</h3>
                            <span className="apple-badge-info text-[10px]">
                                {announcements.length} activo{announcements.length !== 1 ? 's' : ''}
                            </span>
                        </div>

                        <div className="space-y-3">
                            {loading ? (
                                [...Array(2)].map((_, i) => (
                                    <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
                                ))
                            ) : announcements.length === 0 ? (
                                <div className="py-8 text-center">
                                    <Bell className="h-8 w-8 text-[#6e6e73] mx-auto mb-2" strokeWidth={1.5} />
                                    <p className="text-xs text-[#86868b]">Sin avisos activos</p>
                                </div>
                            ) : (
                                announcements.map((ann) => (
                                    <AnnouncementCard key={ann.id} announcement={ann} />
                                ))
                            )}
                        </div>

                        <button
                            onClick={() => window.location.href = '/announcements'}
                            className="apple-button w-full mt-4 text-sm"
                        >
                            Gestionar Avisos
                        </button>
                    </div>

                    {/* System Status */}
                    <div className="apple-card p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${stats.security === 'SECURE'
                                    ? 'bg-[#30d158]/10 text-[#30d158]'
                                    : 'bg-[#ff453a]/10 text-[#ff453a]'
                                }`}>
                                {stats.security === 'SECURE' ? (
                                    <CheckCircle2 className="h-5 w-5" strokeWidth={1.5} />
                                ) : (
                                    <AlertCircle className="h-5 w-5" strokeWidth={1.5} />
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white">Estado del Sistema</p>
                                <p className="text-xs text-[#86868b]">
                                    {stats.security === 'SECURE' ? 'Todos los sistemas operativos' : 'Verificar alertas'}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl bg-white/[0.03] text-center">
                                <p className="text-lg font-semibold text-white">99.9%</p>
                                <p className="text-[10px] text-[#86868b]">Uptime</p>
                            </div>
                            <div className="p-3 rounded-xl bg-white/[0.03] text-center">
                                <p className="text-lg font-semibold text-white">&lt;50ms</p>
                                <p className="text-[10px] text-[#86868b]">Latencia</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default DashboardPage;
