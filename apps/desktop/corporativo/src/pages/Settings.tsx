import React, { useState, useEffect } from 'react';
import {
    Bell, Database, Globe, User, Save, RefreshCcw, Shield, Users, Activity,
    Search, ShieldCheck, Key, Filter, Clock, Eye, X, UserPlus, Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import type { Profile, AuditLog, UserRole } from '@/types';
import { toast } from 'sonner';

// ============================================
// USER REGISTRATION MODAL (Apple-style)
// ============================================

interface UserRegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const UserRegistrationModal: React.FC<UserRegistrationModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        nombre_completo: '',
        role: 'corporate' as UserRole,
        access_level: 1,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [generatedCreds, setGeneratedCreds] = useState<{ email: string; pass: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const suffix = Math.random().toString(36).slice(-4);
            const userNameSlug = formData.nombre_completo.toLowerCase().split(' ')[0] || 'user';
            const generatedEmail = `${userNameSlug}.${suffix}@red-salud.corp`;
            const generatedPassword = `RS.${Math.random().toString(36).slice(-8).toUpperCase()}!`;

            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: generatedEmail,
                password: generatedPassword,
                options: {
                    data: {
                        nombre_completo: formData.nombre_completo,
                        role: formData.role,
                        access_level: formData.access_level,
                    }
                }
            });

            if (authError) throw authError;

            await supabase.from('audit_logs').insert({
                user_id: (await supabase.auth.getUser()).data.user?.id,
                action: 'CREATE_IDENTITY',
                entity_type: 'profile',
                entity_id: authData.user?.id || 'unknown',
                severity: 'info',
                new_data: { ...formData, email: generatedEmail }
            });

            setGeneratedCreds({ email: generatedEmail, pass: generatedPassword });
            toast.success('Usuario creado exitosamente');
            onSuccess();
        } catch (error: any) {
            toast.error('Error: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative w-full max-w-md bg-[#1c1c1e] border border-white/[0.08] rounded-2xl overflow-hidden"
            >
                <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-[#0071e3]/10 text-[#0071e3]">
                            <UserPlus className="h-5 w-5" strokeWidth={1.5} />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Nueva Identidad</h2>
                            <p className="text-caption">Crear usuario administrativo</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/[0.05] text-[#6e6e73]">
                        <X className="h-5 w-5" strokeWidth={1.5} />
                    </button>
                </div>

                {!generatedCreds ? (
                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        <div className="space-y-2">
                            <label className="text-overline">Nombre del Operador</label>
                            <input
                                required
                                type="text"
                                value={formData.nombre_completo}
                                onChange={e => setFormData({ ...formData, nombre_completo: e.target.value })}
                                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-[#0071e3]/50 transition-all"
                                placeholder="Nombre completo"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-overline">Nivel de Acceso</label>
                                <select
                                    value={formData.access_level}
                                    onChange={e => setFormData({ ...formData, access_level: parseInt(e.target.value) })}
                                    className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-[#0071e3]/50 transition-all"
                                >
                                    {[1, 2, 3, 4, 5].map(lvl => (
                                        <option key={lvl} value={lvl} className="bg-[#1c1c1e]">Nivel {lvl}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-overline">Rol</label>
                                <select
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
                                    className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-[#0071e3]/50 transition-all"
                                >
                                    <option value="corporate" className="bg-[#1c1c1e]">Corporativo</option>
                                    <option value="admin" className="bg-[#1c1c1e]">Administrador</option>
                                    <option value="auditor" className="bg-[#1c1c1e]">Auditor</option>
                                </select>
                            </div>
                        </div>

                        <button
                            disabled={isSubmitting}
                            type="submit"
                            className="w-full apple-button py-3 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <RefreshCcw className="h-4 w-4 animate-spin" />
                            ) : (
                                'Generar Identidad'
                            )}
                        </button>
                    </form>
                ) : (
                    <div className="p-6 space-y-5">
                        <div className="p-4 bg-[#30d158]/10 border border-[#30d158]/20 rounded-xl text-center">
                            <ShieldCheck className="h-8 w-8 text-[#30d158] mx-auto mb-2" />
                            <p className="text-sm font-medium text-white">Identidad Creada</p>
                        </div>

                        <div className="space-y-3">
                            <div className="p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl">
                                <p className="text-overline mb-1">Usuario / Email</p>
                                <div className="flex items-center justify-between">
                                    <code className="text-sm font-mono text-white">{generatedCreds.email}</code>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(generatedCreds.email);
                                            toast.success('Copiado');
                                        }}
                                        className="p-1.5 hover:bg-white/[0.05] rounded-lg"
                                    >
                                        <Save className="h-4 w-4 text-[#6e6e73]" strokeWidth={1.5} />
                                    </button>
                                </div>
                            </div>

                            <div className="p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl">
                                <p className="text-overline mb-1">Contraseña Temporal</p>
                                <div className="flex items-center justify-between">
                                    <code className="text-lg font-mono text-[#0071e3] font-semibold">{generatedCreds.pass}</code>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(generatedCreds.pass);
                                            toast.success('Copiado');
                                        }}
                                        className="p-1.5 hover:bg-white/[0.05] rounded-lg"
                                    >
                                        <Save className="h-4 w-4 text-[#6e6e73]" strokeWidth={1.5} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full apple-button-secondary py-3"
                        >
                            Finalizar
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

// ============================================
// IDENTITY MANAGEMENT MODAL
// ============================================

interface IdentityManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: Profile | null;
    onSuccess: () => void;
}

const IdentityManagementModal: React.FC<IdentityManagementModalProps> = ({ isOpen, onClose, user, onSuccess }) => {
    const [newEmail, setNewEmail] = useState('');
    const [newPass, setNewPass] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (user) setNewEmail(user.email || '');
    }, [user]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsSubmitting(true);

        try {
            const updates: Record<string, string> = {};
            if (newEmail !== user.email) updates.email = newEmail;
            if (newPass) updates.password = newPass;

            if (Object.keys(updates).length === 0) {
                toast.error('No hay cambios');
                return;
            }

            const { error } = await supabase.from('profiles').update({
                email: newEmail,
                updated_at: new Date().toISOString()
            }).eq('id', user.id);

            if (error) throw error;

            await supabase.from('audit_logs').insert({
                user_id: (await supabase.auth.getUser()).data.user?.id,
                action: 'UPDATE_IDENTITY',
                entity_type: 'profile',
                entity_id: user.id,
                severity: 'warning',
                new_data: updates
            });

            toast.success('Actualizado');
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error('Error: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-md bg-[#1c1c1e] border border-white/[0.08] rounded-2xl p-6 space-y-5">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-[#ff9f0a]/10 text-[#ff9f0a]">
                        <Shield className="h-5 w-5" strokeWidth={1.5} />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Gestionar Credenciales</h3>
                        <p className="text-caption">{user.nombre_completo}</p>
                    </div>
                </div>

                <form onSubmit={handleUpdate} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-overline">Email</label>
                        <input
                            type="email"
                            value={newEmail}
                            onChange={e => setNewEmail(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-[#0071e3]/50"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-overline">Nueva Contraseña (opcional)</label>
                        <input
                            type="password"
                            placeholder="Dejar vacío para no cambiar"
                            value={newPass}
                            onChange={e => setNewPass(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-[#0071e3]/50"
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 apple-button-secondary py-3">
                            Cancelar
                        </button>
                        <button disabled={isSubmitting} type="submit" className="flex-1 apple-button py-3">
                            {isSubmitting ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

// ============================================
// MAIN SETTINGS PAGE
// ============================================

const SettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'general' | 'users' | 'audit' | 'security'>('general');
    const [users, setUsers] = useState<Profile[]>([]);
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [selectedUserForEdit, setSelectedUserForEdit] = useState<Profile | null>(null);

    const tabs = [
        { id: 'general' as const, label: 'General', icon: Globe },
        { id: 'users' as const, label: 'Usuarios', icon: Users },
        { id: 'audit' as const, label: 'Auditoría', icon: Activity },
        { id: 'security' as const, label: 'Seguridad', icon: Shield },
    ];

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            if (activeTab === 'users') {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .order('access_level', { ascending: false });
                if (error) throw error;
                setUsers(data || []);
            } else if (activeTab === 'audit') {
                const { data, error } = await supabase
                    .from('audit_logs')
                    .select('*, profiles(nombre_completo, email)')
                    .order('created_at', { ascending: false })
                    .limit(50);
                if (error) throw error;
                setLogs(data || []);
            }
        } catch (error: any) {
            toast.error('Error: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto pb-16">
            <UserRegistrationModal
                isOpen={isUserModalOpen}
                onClose={() => setIsUserModalOpen(false)}
                onSuccess={() => fetchData()}
            />
            <IdentityManagementModal
                isOpen={!!selectedUserForEdit}
                onClose={() => setSelectedUserForEdit(null)}
                user={selectedUserForEdit}
                onSuccess={() => fetchData()}
            />

            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col lg:flex-row lg:items-end justify-between gap-6"
            >
                <div className="space-y-2">
                    <p className="text-overline">Sistema</p>
                    <h1 className="text-display text-white">Configuración</h1>
                    <p className="text-body text-[#86868b] max-w-lg">
                        Gestión de parámetros globales, usuarios y seguridad.
                    </p>
                </div>

                <div className="flex bg-white/[0.03] p-1 rounded-xl">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2.5 rounded-lg flex items-center gap-2 text-xs font-medium transition-all ${activeTab === tab.id
                                ? 'bg-[#0071e3] text-white'
                                : 'text-[#86868b] hover:text-white'
                                }`}
                        >
                            <tab.icon className="h-4 w-4" strokeWidth={1.5} />
                            <span className="hidden md:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </motion.header>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {/* GENERAL TAB */}
                    {activeTab === 'general' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6">
                                {/* Global Settings */}
                                <div className="apple-card p-6 space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-[#0071e3]/10 text-[#0071e3]">
                                            <Globe className="h-5 w-5" strokeWidth={1.5} />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-semibold text-white">Parámetros Globales</h2>
                                            <p className="text-caption">Configuración base de infraestructura</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-overline">Organización</label>
                                            <input
                                                type="text"
                                                defaultValue="Red Salud Corporativo"
                                                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-[#0071e3]/50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-overline">Identificador Regional</label>
                                            <input
                                                type="text"
                                                defaultValue="LATAM-VZ-01"
                                                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-[#0071e3]/50"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.06]">
                                        <button className="apple-button-secondary px-4 py-2">Restaurar</button>
                                        <button className="apple-button px-4 py-2 flex items-center gap-2">
                                            <Save className="h-4 w-4" strokeWidth={1.5} />
                                            Guardar
                                        </button>
                                    </div>
                                </div>

                                {/* Notifications */}
                                <div className="apple-card p-6 space-y-5">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-[#ff9f0a]/10 text-[#ff9f0a]">
                                            <Bell className="h-5 w-5" strokeWidth={1.5} />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-semibold text-white">Notificaciones</h2>
                                            <p className="text-caption">Gestión de alertas del sistema</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {[
                                            { label: 'Alertas de Seguridad', desc: 'Fallos críticos del sistema', active: true },
                                            { label: 'Nuevos Nodos', desc: 'Solicitudes de acceso', active: true },
                                            { label: 'Reportes Semanales', desc: 'Analíticas por correo', active: false },
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.04] rounded-xl">
                                                <div>
                                                    <p className="text-sm font-medium text-white">{item.label}</p>
                                                    <p className="text-caption">{item.desc}</p>
                                                </div>
                                                <div className={`h-6 w-10 rounded-full p-0.5 ${item.active ? 'bg-[#0071e3]' : 'bg-white/[0.1]'}`}>
                                                    <div className={`h-5 w-5 rounded-full bg-white transition-transform ${item.active ? 'translate-x-4' : ''}`} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-6">
                                <div className="apple-card p-6 border-[#30d158]/20">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Database className="h-5 w-5 text-[#30d158]" strokeWidth={1.5} />
                                        <h3 className="text-base font-semibold text-white">Base de Datos</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between">
                                            <span className="text-caption">Latencia</span>
                                            <span className="text-sm font-medium text-white">24ms</span>
                                        </div>
                                        <div className="h-1.5 bg-white/[0.1] rounded-full overflow-hidden">
                                            <div className="h-full w-[85%] bg-[#30d158] rounded-full" />
                                        </div>
                                        <button className="w-full apple-button-secondary py-2.5 flex items-center justify-center gap-2 text-[#30d158]">
                                            <RefreshCcw className="h-4 w-4" strokeWidth={1.5} />
                                            Sincronizar
                                        </button>
                                    </div>
                                </div>

                                <div className="apple-card p-6 text-center">
                                    <div className="h-14 w-14 rounded-2xl bg-[#0071e3]/10 flex items-center justify-center text-[#0071e3] mx-auto mb-4">
                                        <User className="h-7 w-7" strokeWidth={1.5} />
                                    </div>
                                    <h3 className="text-base font-semibold text-white">Root Admin</h3>
                                    <p className="text-caption mb-4">Sector Principal</p>
                                    <button className="w-full apple-button-secondary py-2.5">
                                        Cambiar Credenciales
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* USERS TAB */}
                    {activeTab === 'users' && (
                        <div className="space-y-6">
                            {/* Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { label: 'Total', val: users.length, icon: Users, color: '#0071e3' },
                                    { label: 'Root', val: users.filter(u => u.access_level === 5).length, icon: ShieldCheck, color: '#ff9f0a' },
                                    { label: 'Nivel 1-3', val: users.filter(u => u.access_level && u.access_level < 4).length, icon: User, color: '#30d158' },
                                    { label: 'Activos', val: '4', icon: Activity, color: '#5e5ce6' },
                                ].map((stat, i) => (
                                    <div key={i} className="stat-card">
                                        <div className="flex items-center gap-2 mb-2">
                                            <stat.icon className="h-4 w-4" style={{ color: stat.color }} strokeWidth={1.5} />
                                            <span className="text-overline">{stat.label}</span>
                                        </div>
                                        <p className="text-2xl font-semibold text-white">{stat.val}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Users Table */}
                            <div className="apple-card overflow-hidden">
                                <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
                                    <h2 className="text-base font-semibold text-white">Directorio</h2>
                                    <button
                                        onClick={() => setIsUserModalOpen(true)}
                                        className="apple-button py-2 px-4 flex items-center gap-2"
                                    >
                                        <Plus className="h-4 w-4" strokeWidth={1.5} />
                                        Nueva Identidad
                                    </button>
                                </div>
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                                            <th className="px-5 py-3 text-left text-overline">Usuario</th>
                                            <th className="px-5 py-3 text-left text-overline">Nivel</th>
                                            <th className="px-5 py-3 text-left text-overline">Estado</th>
                                            <th className="px-5 py-3 text-right text-overline">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/[0.04]">
                                        {isLoading ? (
                                            <tr>
                                                <td colSpan={4} className="px-5 py-16 text-center">
                                                    <RefreshCcw className="h-5 w-5 text-[#0071e3] animate-spin mx-auto mb-2" />
                                                    <p className="text-caption">Cargando...</p>
                                                </td>
                                            </tr>
                                        ) : users.map((user) => (
                                            <tr key={user.id} className="group hover:bg-white/[0.02]">
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-9 w-9 rounded-lg bg-white/[0.05] border border-white/[0.06] flex items-center justify-center text-xs font-medium text-white">
                                                            {user.nombre_completo?.[0] || '?'}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-white">{user.nombre_completo || 'Sin nombre'}</p>
                                                            <p className="text-xs text-[#6e6e73]">{user.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-[#0071e3]/10 text-[#0071e3]">
                                                        Lvl {user.access_level}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`h-2 w-2 rounded-full ${user.access_level && user.access_level > 0 ? 'bg-[#30d158]' : 'bg-[#6e6e73]'}`} />
                                                        <span className="text-xs text-[#86868b]">{user.access_level && user.access_level > 0 ? 'Activo' : 'Inactivo'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    <button
                                                        onClick={() => setSelectedUserForEdit(user)}
                                                        className="p-2 rounded-lg hover:bg-white/[0.05] text-[#6e6e73] hover:text-[#0071e3]"
                                                    >
                                                        <Key className="h-4 w-4" strokeWidth={1.5} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* AUDIT TAB */}
                    {activeTab === 'audit' && (
                        <div className="apple-card p-6 space-y-6">
                            <div className="flex items-center justify-between border-b border-white/[0.06] pb-5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-[#5e5ce6]/10 text-[#5e5ce6]">
                                        <Activity className="h-5 w-5" strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-white">Audit Log</h2>
                                        <p className="text-caption">Eventos del sistema</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6e6e73]" strokeWidth={1.5} />
                                        <input
                                            type="text"
                                            placeholder="Buscar..."
                                            className="bg-white/[0.03] border border-white/[0.06] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white w-48 focus:outline-none focus:border-[#0071e3]/50"
                                        />
                                    </div>
                                    <button className="apple-button-secondary py-2 px-4 flex items-center gap-2">
                                        <Filter className="h-4 w-4" strokeWidth={1.5} />
                                        Filtros
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {isLoading ? (
                                    <div className="py-16 text-center">
                                        <RefreshCcw className="h-5 w-5 text-[#5e5ce6] animate-spin mx-auto mb-2" />
                                        <p className="text-caption">Cargando logs...</p>
                                    </div>
                                ) : logs.length === 0 ? (
                                    <div className="py-16 text-center border border-white/[0.06] rounded-xl">
                                        <Activity className="h-8 w-8 text-[#3a3a3c] mx-auto mb-2" />
                                        <p className="text-caption">Sin eventos</p>
                                    </div>
                                ) : logs.map((log) => (
                                    <div key={log.id} className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/[0.04] rounded-xl hover:border-[#5e5ce6]/30 transition-colors">
                                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${log.severity === 'critical' ? 'bg-[#ff453a]/10 text-[#ff453a]' :
                                                log.severity === 'warning' ? 'bg-[#ff9f0a]/10 text-[#ff9f0a]' :
                                                    'bg-[#0071e3]/10 text-[#0071e3]'
                                            }`}>
                                            <Clock className="h-4 w-4" strokeWidth={1.5} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-medium text-white">{log.profiles?.nombre_completo || 'Sistema'}</span>
                                                <span className="text-xs text-[#6e6e73]">{log.action}</span>
                                            </div>
                                            <p className="text-sm text-[#86868b]">
                                                {log.entity_type} <span className="text-[#5e5ce6]">{log.entity_id.slice(0, 8)}</span>
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-[#6e6e73] mb-1">{new Date(log.created_at).toLocaleTimeString()}</p>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${log.severity === 'critical' ? 'bg-[#ff453a] text-white' :
                                                    log.severity === 'warning' ? 'bg-[#ff9f0a] text-black' :
                                                        'bg-[#0071e3] text-white'
                                                }`}>
                                                {log.severity}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* SECURITY TAB */}
                    {activeTab === 'security' && (
                        <div className="space-y-6">
                            <div className="apple-card p-6 space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-[#ff453a]/10 text-[#ff453a]">
                                        <ShieldCheck className="h-5 w-5" strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-white">Seguridad Avanzada</h2>
                                        <p className="text-caption">Cifrado y claves maestras</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-5 bg-white/[0.02] border border-white/[0.04] rounded-xl space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-medium text-white">Clave Maestra</h3>
                                            <span className="px-2 py-0.5 bg-[#ff453a]/20 text-[#ff453a] rounded text-[10px] font-medium">Crítico</span>
                                        </div>
                                        <p className="text-caption text-xs leading-relaxed">
                                            Bypass total del sistema. La rotación invalida todas las sesiones.
                                        </p>
                                        <button className="w-full py-2.5 bg-[#ff453a] hover:bg-[#ff453a]/90 rounded-xl text-xs font-medium text-white transition-all">
                                            Rotar Clave
                                        </button>
                                    </div>

                                    <div className="p-5 bg-white/[0.02] border border-white/[0.04] rounded-xl space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-medium text-white">2FA Obligatorio</h3>
                                            <span className="px-2 py-0.5 bg-[#0071e3]/20 text-[#0071e3] rounded text-[10px] font-medium">Recomendado</span>
                                        </div>
                                        <p className="text-caption text-xs leading-relaxed">
                                            Forzar 2FA para usuarios con nivel superior a 3.
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-[#6e6e73]">Desactivado</span>
                                            <div className="h-6 w-10 bg-white/[0.1] rounded-full p-0.5 cursor-pointer">
                                                <div className="h-5 w-5 bg-white rounded-full" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="apple-card p-6 space-y-5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-[#ff9f0a]/10 text-[#ff9f0a]">
                                        <Eye className="h-5 w-5" strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-white">Monitoreo</h2>
                                        <p className="text-caption">Detección de intrusiones</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {[
                                        { name: 'Login Foráneo', active: true, desc: 'IPs no registradas' },
                                        { name: 'Rate Limiting', active: true, desc: '100 req/sec' },
                                        { name: 'Modo Pánico', active: false, desc: 'Bloqueo total' },
                                    ].map((policy, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.04] rounded-xl">
                                            <div>
                                                <h4 className="text-sm font-medium text-white">{policy.name}</h4>
                                                <p className="text-caption text-xs">{policy.desc}</p>
                                            </div>
                                            <div className={`h-6 w-10 rounded-full p-0.5 ${policy.active ? 'bg-[#0071e3]' : 'bg-white/[0.1]'}`}>
                                                <div className={`h-5 w-5 rounded-full bg-white transition-transform ${policy.active ? 'translate-x-4' : ''}`} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default SettingsPage;
