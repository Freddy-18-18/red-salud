import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    MoreVertical,
    Shield,
    User,
    MapPin,
    Calendar,
    Stethoscope,
    Building2,
    Heart,
    Lock,
    RefreshCw,
    Plus,
    X,
    Mail,
    UserPlus,
    Crown,
    Settings,
    Calculator,
    Users,
    Headphones,
    BarChart3,
    Eye,
    Briefcase
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { Profile, Permissions, UserRole } from '@/types';
import { usePermissions } from '@/hooks/usePermissions';
import { getCorporateRoleOptions } from '@/types/corporate-users.types';

// ============================================
// ROLE BADGE HELPER
// ============================================

const getRoleBadge = (role: string) => {
    switch (role) {
        case 'medico': return { icon: Stethoscope, text: 'Médico', color: '#0071e3' };
        case 'farmacia': return { icon: Building2, text: 'Farmacia', color: '#5e5ce6' };
        case 'paciente': return { icon: Heart, text: 'Paciente', color: '#ff375f' };
        case 'admin': return { icon: Shield, text: 'Admin', color: '#30d158' };
        case 'corporate': return { icon: Briefcase, text: 'Corporativo', color: '#ffd60a' };
        case 'gerente': return { icon: Crown, text: 'Gerente', color: '#bf5af2' };
        case 'administrador': return { icon: Settings, text: 'Administrador', color: '#64d2ff' };
        case 'contador': return { icon: Calculator, text: 'Contador', color: '#30d158' };
        case 'rrhh': return { icon: Users, text: 'RRHH', color: '#ff9f0a' };
        case 'soporte': return { icon: Headphones, text: 'Soporte', color: '#ff453a' };
        case 'analista': return { icon: BarChart3, text: 'Analista', color: '#64d2ff' };
        case 'supervisor': return { icon: Eye, text: 'Supervisor', color: '#0071e3' };
        default: return { icon: User, text: role, color: '#86868b' };
    }
};

// ============================================
// MAIN COMPONENT
// ============================================

const UsersPage: React.FC = () => {
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('ALL');
    const { accessLevel, isRoot } = usePermissions();
    const [newUser, setNewUser] = useState({
        email: '',
        password: '',
        nombre_completo: '',
        role: 'corporate' as UserRole,
        access_level: 1,
        permissions: {
            can_manage_users: false,
            can_manage_roles: false,
            can_view_analytics: false,
            can_edit_settings: false,
            can_manage_medical_records: false,
            can_process_payments: false,
            can_manage_inventory: false,
            can_access_audit_logs: false,
            can_broadcast_announcements: false,
            can_configure_system: false
        } as Permissions
    });
    const [creating, setCreating] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, [roleFilter]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (roleFilter !== 'ALL') {
                query = query.eq('role', roleFilter);
            }

            const { data, error } = await query;
            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Error al cargar usuarios');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        try {
            const { error: authError } = await supabase.auth.signUp({
                email: newUser.email,
                password: newUser.password,
                options: {
                    data: {
                        nombre_completo: newUser.nombre_completo,
                        role: newUser.role,
                        access_level: newUser.access_level,
                        permissions: newUser.permissions
                    }
                }
            });

            if (authError) throw authError;

            toast.success('Usuario creado exitosamente');
            setShowAddModal(false);
            setNewUser({
                email: '',
                password: '',
                nombre_completo: '',
                role: 'corporate',
                access_level: 1,
                permissions: {
                    can_manage_users: false,
                    can_manage_roles: false,
                    can_view_analytics: false,
                    can_edit_settings: false,
                    can_manage_medical_records: false,
                    can_process_payments: false,
                    can_manage_inventory: false,
                    can_access_audit_logs: false,
                    can_broadcast_announcements: false,
                    can_configure_system: false
                }
            });
            fetchUsers();
        } catch (error: any) {
            toast.error(error.message || 'Error al crear usuario');
        } finally {
            setCreating(false);
        }
    };

    const filteredUsers = users.filter(user =>
        (user.nombre_completo?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    const roleFilters = ['ALL', 'medico', 'farmacia', 'paciente', 'admin', 'gerente', 'contador'];

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto pb-16">
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col lg:flex-row lg:items-end justify-between gap-6"
            >
                <div className="space-y-2">
                    <p className="text-overline">Directorio</p>
                    <h1 className="text-display text-white">Usuarios</h1>
                    <p className="text-body text-[#86868b] max-w-lg">
                        Gestión de identidades y perfiles en la red Red-Salud.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchUsers}
                        disabled={loading}
                        className="apple-button-secondary h-10 w-10 !p-0 rounded-xl flex items-center justify-center"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} strokeWidth={1.5} />
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="apple-button flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" strokeWidth={1.5} />
                        Nuevo Usuario
                    </button>
                </div>
            </motion.header>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total', value: users.length, icon: User },
                    { label: 'Médicos', value: users.filter(u => u.role === 'medico').length, icon: Stethoscope },
                    { label: 'Farmacias', value: users.filter(u => u.role === 'farmacia').length, icon: Building2 },
                    { label: 'Pacientes', value: users.filter(u => u.role === 'paciente').length, icon: Heart }
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="stat-card"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <stat.icon className="h-4 w-4 text-[#0071e3]" strokeWidth={1.5} />
                            <span className="text-overline">{stat.label}</span>
                        </div>
                        <p className="text-2xl font-semibold text-white">{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex bg-white/[0.03] p-1 rounded-xl overflow-x-auto">
                    {roleFilters.map((role) => (
                        <button
                            key={role}
                            onClick={() => setRoleFilter(role)}
                            className={`px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${roleFilter === role
                                    ? 'bg-[#0071e3] text-white'
                                    : 'text-[#86868b] hover:text-white'
                                }`}
                        >
                            {role === 'ALL' ? 'Todos' : role.charAt(0).toUpperCase() + role.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6e6e73]" strokeWidth={1.5} />
                    <input
                        type="text"
                        placeholder="Buscar usuario..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-[#6e6e73] focus:outline-none focus:border-[#0071e3]/50 transition-all"
                    />
                </div>
            </div>

            {/* Users Table */}
            <div className="apple-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/[0.06]">
                                <th className="px-6 py-4 text-left text-overline">Usuario</th>
                                <th className="px-6 py-4 text-left text-overline">Rol</th>
                                <th className="px-6 py-4 text-left text-overline">Ubicación</th>
                                <th className="px-6 py-4 text-left text-overline">Registro</th>
                                <th className="px-6 py-4 text-center text-overline">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                            <AnimatePresence mode='popLayout'>
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center">
                                            <RefreshCw className="h-6 w-6 text-[#0071e3] animate-spin mx-auto mb-3" />
                                            <p className="text-caption">Cargando usuarios...</p>
                                        </td>
                                    </tr>
                                ) : filteredUsers.length > 0 ? (
                                    filteredUsers.map((user, idx) => {
                                        const role = getRoleBadge(user.role);
                                        return (
                                            <motion.tr
                                                key={user.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: idx * 0.03 }}
                                                className="group hover:bg-white/[0.02] transition-colors"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 rounded-xl bg-white/[0.05] border border-white/[0.06] flex items-center justify-center text-[#86868b] group-hover:border-[#0071e3]/30 transition-colors">
                                                            <User className="h-4 w-4" strokeWidth={1.5} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-white group-hover:text-[#0071e3] transition-colors">
                                                                {user.nombre_completo || 'Sin nombre'}
                                                            </p>
                                                            <p className="text-xs text-[#6e6e73]">{user.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
                                                            style={{
                                                                backgroundColor: `${role.color}15`,
                                                                color: role.color
                                                            }}
                                                        >
                                                            <role.icon className="h-3 w-3" strokeWidth={1.5} />
                                                            {role.text}
                                                        </span>
                                                        <span className="text-[10px] text-[#6e6e73]">
                                                            Lvl {user.access_level || 1}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-[#86868b]">
                                                        <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} />
                                                        <span className="text-xs">{user.ciudad || 'N/A'}, {user.estado || 'N/A'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-[#6e6e73]">
                                                        <Calendar className="h-3.5 w-3.5" strokeWidth={1.5} />
                                                        <span className="text-xs">
                                                            {new Date(user.created_at).toLocaleDateString('es-VE', {
                                                                day: '2-digit',
                                                                month: 'short',
                                                                year: 'numeric'
                                                            })}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button className="p-2 rounded-lg hover:bg-white/[0.05] text-[#6e6e73] hover:text-[#0071e3] transition-all">
                                                            <Lock className="h-4 w-4" strokeWidth={1.5} />
                                                        </button>
                                                        <button className="p-2 rounded-lg hover:bg-white/[0.05] text-[#6e6e73] hover:text-white transition-all">
                                                            <MoreVertical className="h-4 w-4" strokeWidth={1.5} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center">
                                            <Shield className="h-10 w-10 text-[#3a3a3c] mx-auto mb-3" />
                                            <p className="text-caption">Sin resultados</p>
                                        </td>
                                    </tr>
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Footer Stats */}
            <div className="flex items-center justify-between text-caption">
                <span>Nivel de acceso: {accessLevel} {isRoot && '(Root)'}</span>
                <span>{filteredUsers.length} usuarios mostrados</span>
            </div>

            {/* Add User Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !creating && setShowAddModal(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative w-full max-w-2xl bg-[#1c1c1e] border border-white/[0.08] rounded-2xl overflow-hidden max-h-[90vh] flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 rounded-xl bg-[#0071e3]/10 text-[#0071e3]">
                                        <UserPlus className="h-5 w-5" strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-white">Nuevo Usuario</h2>
                                        <p className="text-caption">Crear identidad en la red</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="p-2 rounded-lg hover:bg-white/[0.05] text-[#6e6e73] transition-colors"
                                >
                                    <X className="h-5 w-5" strokeWidth={1.5} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <form onSubmit={handleCreateUser} className="flex-1 overflow-y-auto p-6 space-y-6">
                                {/* Basic Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-overline">Nombre Completo</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6e6e73]" strokeWidth={1.5} />
                                            <input
                                                required
                                                type="text"
                                                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#0071e3]/50 transition-all"
                                                placeholder="Nombre del usuario"
                                                value={newUser.nombre_completo}
                                                onChange={e => setNewUser({ ...newUser, nombre_completo: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-overline">Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6e6e73]" strokeWidth={1.5} />
                                            <input
                                                required
                                                type="email"
                                                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#0071e3]/50 transition-all"
                                                placeholder="correo@ejemplo.com"
                                                value={newUser.email}
                                                onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-overline">Contraseña Temporal</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6e6e73]" strokeWidth={1.5} />
                                            <input
                                                required
                                                type="password"
                                                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#0071e3]/50 transition-all font-mono"
                                                placeholder="••••••••"
                                                value={newUser.password}
                                                onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Role Selection */}
                                <div className="space-y-3">
                                    <label className="text-overline">Rol</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                        {getCorporateRoleOptions().map((roleOption) => {
                                            const IconComponent = {
                                                gerente: Crown,
                                                administrador: Settings,
                                                contador: Calculator,
                                                rrhh: Users,
                                                soporte: Headphones,
                                                analista: BarChart3,
                                                supervisor: Eye
                                            }[roleOption.value] || Briefcase;

                                            return (
                                                <button
                                                    key={roleOption.value}
                                                    type="button"
                                                    onClick={() => setNewUser({
                                                        ...newUser,
                                                        role: roleOption.value as UserRole,
                                                        access_level: roleOption.accessLevel
                                                    })}
                                                    className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-2 ${newUser.role === roleOption.value
                                                            ? 'bg-[#0071e3]/15 border-[#0071e3]/50 text-white'
                                                            : 'bg-white/[0.02] border-white/[0.06] text-[#86868b] hover:border-white/20'
                                                        }`}
                                                >
                                                    <IconComponent className="h-4 w-4" strokeWidth={1.5} />
                                                    <span className="text-[10px] font-medium">{roleOption.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Access Level */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-overline">Nivel de Acceso</label>
                                        <span className="text-sm font-medium text-[#0071e3]">Nivel {newUser.access_level}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1"
                                        max="5"
                                        value={newUser.access_level}
                                        onChange={(e) => setNewUser({ ...newUser, access_level: parseInt(e.target.value) })}
                                        className="w-full h-1.5 bg-white/[0.1] rounded-full appearance-none cursor-pointer accent-[#0071e3]"
                                    />
                                    <div className="flex justify-between text-[10px] text-[#6e6e73]">
                                        <span>Operaciones</span>
                                        <span>Root</span>
                                    </div>
                                </div>

                                {/* Permissions */}
                                <div className="space-y-3">
                                    <label className="text-overline">Permisos</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {Object.entries(newUser.permissions).slice(0, 6).map(([key, value]) => (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() => setNewUser({
                                                    ...newUser,
                                                    permissions: { ...newUser.permissions, [key]: !value }
                                                })}
                                                className={`p-3 rounded-xl border transition-all flex items-center justify-between ${value
                                                        ? 'bg-[#30d158]/10 border-[#30d158]/30 text-white'
                                                        : 'bg-white/[0.02] border-white/[0.06] text-[#6e6e73]'
                                                    }`}
                                            >
                                                <span className="text-[10px] font-medium capitalize">
                                                    {key.replace(/can_/g, '').replace(/_/g, ' ')}
                                                </span>
                                                <div className={`h-4 w-8 rounded-full transition-colors ${value ? 'bg-[#30d158]' : 'bg-white/[0.1]'}`}>
                                                    <motion.div
                                                        animate={{ x: value ? 16 : 2 }}
                                                        className="h-3 w-3 mt-0.5 rounded-full bg-white"
                                                    />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </form>

                            {/* Modal Footer */}
                            <div className="p-6 border-t border-white/[0.06]">
                                <button
                                    disabled={creating}
                                    type="submit"
                                    onClick={handleCreateUser}
                                    className="w-full apple-button py-3 flex items-center justify-center gap-2"
                                >
                                    {creating ? (
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            <UserPlus className="h-4 w-4" strokeWidth={1.5} />
                                            Crear Usuario
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UsersPage;
