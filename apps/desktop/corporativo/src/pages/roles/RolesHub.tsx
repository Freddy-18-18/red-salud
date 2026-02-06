import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    Stethoscope,
    Building2,
    Heart,
    Activity,
    ShieldCheck,
    ChevronRight,
    Search,
    RefreshCw
} from 'lucide-react';
import { getCorporateStats } from '../../services/supabase.queries';

// ============================================
// TYPES
// ============================================

interface RoleCategory {
    id: string;
    title: string;
    description: string;
    icon: React.ElementType;
    count: string | number;
    path: string;
    isComingSoon?: boolean;
}

// ============================================
// INITIAL DATA
// ============================================

const initialRoles: RoleCategory[] = [
    {
        id: 'pacientes',
        title: 'Pacientes',
        description: 'Base de usuarios registrados como pacientes en la plataforma.',
        icon: Heart,
        count: '...',
        path: '/roles/paciente'
    },
    {
        id: 'doctores',
        title: 'Médicos',
        description: 'Profesionales de salud activos con credenciales verificadas.',
        icon: Stethoscope,
        count: '...',
        path: '/roles/medico'
    },
    {
        id: 'farmacias',
        title: 'Farmacias',
        description: 'Red de establecimientos farmacéuticos afiliados.',
        icon: Building2,
        count: '...',
        path: '/roles/farmacias'
    },
    {
        id: 'ambulancia',
        title: 'Ambulancias',
        description: 'Unidades de transporte médico de emergencia.',
        icon: Activity,
        count: '0',
        path: '/roles/ambulancia',
        isComingSoon: true
    },
    {
        id: 'clinica',
        title: 'Clínicas',
        description: 'Centros de salud y hospitales asociados.',
        icon: Building2,
        count: '0',
        path: '/roles/clinica',
        isComingSoon: true
    },
    {
        id: 'seguro',
        title: 'Seguros',
        description: 'Compañías aseguradoras integradas.',
        icon: ShieldCheck,
        count: '0',
        path: '/roles/seguro',
        isComingSoon: true
    },
    {
        id: 'secretaria',
        title: 'Secretarias',
        description: 'Personal administrativo de consultorios.',
        icon: Users,
        count: '0',
        path: '/roles/secretaria',
        isComingSoon: true
    }
];

// ============================================
// ROLE CARD COMPONENT
// ============================================

interface RoleCardProps {
    role: RoleCategory;
    index: number;
    loading: boolean;
    onClick: () => void;
}

const RoleCard: React.FC<RoleCardProps> = ({ role, index, loading, onClick }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        onClick={onClick}
        className={`apple-card p-6 cursor-pointer group ${role.isComingSoon ? 'opacity-50' : ''
            }`}
    >
        <div className="flex items-start justify-between mb-5">
            <div className={`p-3 rounded-xl transition-colors ${role.isComingSoon
                    ? 'bg-white/5 text-[#6e6e73]'
                    : 'bg-[#0071e3]/10 text-[#0071e3] group-hover:bg-[#0071e3]/15'
                }`}>
                <role.icon className="h-5 w-5" strokeWidth={1.5} />
            </div>

            <div className="text-right">
                <p className="text-overline mb-1">Total</p>
                {loading ? (
                    <div className="h-6 w-12 bg-white/5 rounded animate-pulse" />
                ) : (
                    <p className="text-xl font-semibold text-white">{role.count}</p>
                )}
            </div>
        </div>

        <div className="space-y-2 mb-5">
            <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-white group-hover:text-[#0071e3] transition-colors">
                    {role.title}
                </h3>
                {role.isComingSoon && (
                    <span className="px-2 py-0.5 rounded-full bg-[#ffd60a]/10 text-[#ffd60a] text-[9px] font-medium">
                        Próximamente
                    </span>
                )}
            </div>
            <p className="text-caption line-clamp-2 h-10">{role.description}</p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/[0.04]">
            <div className="flex items-center gap-2">
                <span className={`h-1.5 w-1.5 rounded-full ${role.isComingSoon ? 'bg-[#6e6e73]' : 'bg-[#30d158] animate-pulse-soft'
                    }`} />
                <span className="text-[10px] text-[#86868b] font-medium">
                    {role.isComingSoon ? 'No disponible' : 'Activo'}
                </span>
            </div>
            <ChevronRight className="h-4 w-4 text-[#6e6e73] group-hover:text-[#0071e3] group-hover:translate-x-0.5 transition-all" />
        </div>
    </motion.div>
);

// ============================================
// MAIN COMPONENT
// ============================================

const RolesHub: React.FC = () => {
    const navigate = useNavigate();
    const [roles, setRoles] = useState<RoleCategory[]>(initialRoles);
    const [totalRoles, setTotalRoles] = useState(0);
    const [activeRoles, setActiveRoles] = useState(0);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchRoleCounts = async () => {
        try {
            setLoading(true);
            const stats = await getCorporateStats();

            setRoles(prev => prev.map(role => {
                let count: number = 0;
                if (role.id === 'pacientes') count = stats.patients;
                if (role.id === 'doctores') count = stats.doctors;
                if (role.id === 'farmacias') count = stats.pharmacies;

                return {
                    ...role,
                    count: role.isComingSoon ? '0' : count
                };
            }));

            setTotalRoles(stats.totalUsers);
            const active = [stats.doctors, stats.patients, stats.pharmacies].filter(c => c > 0).length;
            setActiveRoles(active);
        } catch (err) {
            console.error('[RolesHub] Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoleCounts();
    }, []);

    const filteredRoles = roles.filter(role =>
        role.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto pb-16">
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col lg:flex-row lg:items-end justify-between gap-6"
            >
                <div className="space-y-2">
                    <p className="text-overline">Gestión de Red</p>
                    <h1 className="text-display text-white">Roles</h1>
                    <p className="text-body text-[#86868b] max-w-lg">
                        Administra los diferentes tipos de usuarios en la plataforma Red-Salud.
                    </p>
                </div>

                {/* Stats Pills */}
                <div className="flex items-center gap-3">
                    <div className="apple-glass rounded-full px-5 py-3 flex items-center gap-4">
                        <div className="text-center">
                            <p className="text-[10px] text-[#86868b] font-medium">Total</p>
                            <p className="text-lg font-semibold text-white">
                                {loading ? '...' : totalRoles.toLocaleString()}
                            </p>
                        </div>
                        <div className="h-8 w-px bg-white/10" />
                        <div className="text-center">
                            <p className="text-[10px] text-[#86868b] font-medium">Activos</p>
                            <p className="text-lg font-semibold text-[#0071e3]">
                                {loading ? '...' : activeRoles}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={fetchRoleCounts}
                        disabled={loading}
                        className="apple-button-secondary h-12 w-12 !p-0 rounded-full flex items-center justify-center"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} strokeWidth={1.5} />
                    </button>
                </div>
            </motion.header>

            {/* Search Bar */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative"
            >
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6e6e73]" strokeWidth={1.5} />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar categoría..."
                    className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-[#6e6e73] focus:outline-none focus:border-[#0071e3]/50 focus:bg-white/[0.04] transition-all"
                />
            </motion.div>

            {/* Roles Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredRoles.map((role, idx) => (
                    <RoleCard
                        key={role.id}
                        role={role}
                        index={idx}
                        loading={loading}
                        onClick={() => navigate(role.path)}
                    />
                ))}
            </div>

            {/* Info Banner */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="apple-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
                <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-[#0071e3]/10 text-[#0071e3]">
                        <ShieldCheck className="h-5 w-5" strokeWidth={1.5} />
                    </div>
                    <div>
                        <h3 className="text-title text-white mb-1">Gestión Unificada</h3>
                        <p className="text-caption max-w-xl">
                            Todos los roles comparten el mismo sistema de autenticación segura y permisos granulares.
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/users')}
                    className="apple-button text-sm flex items-center gap-2 shrink-0"
                >
                    <Users className="h-4 w-4" strokeWidth={1.5} />
                    Ver Usuarios
                </button>
            </motion.div>
        </div>
    );
};

export default RolesHub;
