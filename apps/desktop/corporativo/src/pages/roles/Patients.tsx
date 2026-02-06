import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Heart,
    Search,
    RefreshCw,
    User,
    MapPin,
    Calendar,
    MoreVertical,
    ArrowLeft,
    Filter,
    Activity,
    Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Profile {
    id: string;
    nombre_completo: string | null;
    email: string | null;
    role: 'paciente';
    estado: string | null;
    ciudad: string | null;
    created_at: string;
}

const PatientsPage: React.FC = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const premiumEasing: any = [0.16, 1, 0.3, 1];

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'paciente')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error('Error fetching patients:', error);
            toast.error('Error al cargar el directorio de pacientes');
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user =>
        (user.nombre_completo?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-12 max-w-[1600px] mx-auto pb-20">
            {/* Header Section */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: premiumEasing }}
                    className="space-y-4"
                >
                    <button
                        onClick={() => navigate('/roles')}
                        className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-blue-500 transition-colors group mb-6"
                    >
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        Regresar al Hub
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="h-px w-12 bg-rose-500/50" />
                        <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.4em]">Directorio de Ciudadanos</span>
                    </div>
                    <h1 className="text-6xl font-black text-white tracking-tighter italic uppercase group transition-all">
                        GESTIÓN DE <span className="text-rose-500 group-hover:text-rose-400 transition-colors">PACIENTES</span>
                    </h1>
                    <p className="text-slate-500 font-bold text-sm tracking-wide max-w-xl uppercase leading-relaxed">
                        Administración centralizada de perfiles y estados de salud pública en la red corporativa.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: premiumEasing }}
                    className="flex bg-slate-900/40 p-4 rounded-[2.5rem] border border-white/[0.05] backdrop-blur-3xl shadow-2xl gap-8 px-10 items-center"
                >
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
                            <Activity className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Registrados</p>
                            <p className="text-2xl font-black text-white italic">{users.length}</p>
                        </div>
                    </div>
                    <div className="h-10 w-px bg-white/10" />
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                            <Shield className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Estado Seguro</p>
                            <p className="text-2xl font-black text-emerald-500 italic">ACTIVO</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Tactical Control Bar */}
            <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/[0.05] rounded-[2rem] p-6 flex flex-col md:flex-row gap-6 items-center shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-rose-500/50 to-transparent opacity-30" />

                <div className="relative flex-1 group w-full">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600 group-focus-within:text-rose-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="BUSCAR PACIENTE POR NOMBRE O CORREO..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/[0.02] border border-white/[0.05] rounded-2xl py-4 pl-16 pr-6 text-xs font-black uppercase tracking-widest text-white placeholder:text-slate-700 focus:outline-none focus:border-rose-500/40 focus:bg-white/[0.04] transition-all"
                    />
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={fetchPatients}
                        className="p-4 bg-slate-950/60 border border-white/[0.03] rounded-2xl text-slate-500 hover:text-rose-500 hover:border-rose-500/30 transition-all flex items-center gap-3 font-black uppercase tracking-widest text-[10px]"
                    >
                        <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                        Sincronizar
                    </motion.button>
                    <button className="px-8 py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-rose-900/20 transition-all flex items-center gap-3">
                        <Filter className="h-5 w-5" />
                        Filtros Avanzados
                    </button>
                </div>
            </div>

            {/* Patients Grid/Table */}
            <div className="bg-slate-900/20 backdrop-blur-xl border border-white/[0.03] rounded-[3rem] overflow-hidden shadow-2xl relative group">
                <div className="absolute inset-0 bg-rose-500/[0.01] pointer-events-none" />

                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/[0.05] bg-white/[0.02]">
                                <th className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">Ciudadano</th>
                                <th className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">Ubicación</th>
                                <th className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">Registro</th>
                                <th className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">Estado</th>
                                <th className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] text-center">Protocolos</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                            <AnimatePresence mode='popLayout'>
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-10 py-40 text-center">
                                            <div className="flex flex-col items-center gap-6">
                                                <div className="h-1 w-48 bg-slate-800 rounded-full overflow-hidden relative">
                                                    <motion.div
                                                        animate={{ left: ['-100%', '100%'] }}
                                                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                                                        className="absolute inset-0 w-1/2 bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.8)]"
                                                    />
                                                </div>
                                                <p className="text-[12px] font-black text-slate-500 uppercase tracking-[0.5em] animate-pulse">Consultando Bóveda de Pacientes...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredUsers.length > 0 ? (
                                    filteredUsers.map((user, idx) => (
                                        <motion.tr
                                            key={user.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.4, delay: idx * 0.05 }}
                                            className="group hover:bg-rose-600/[0.03] transition-all cursor-default"
                                        >
                                            <td className="px-10 py-7">
                                                <div className="flex items-center gap-5">
                                                    <div className="h-14 w-14 rounded-2xl bg-slate-950/80 border border-white/[0.05] flex items-center justify-center text-slate-600 group-hover:text-rose-500 group-hover:border-rose-500/30 transition-all relative overflow-hidden">
                                                        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        <User className="h-6 w-6 relative z-10" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-base font-black text-white tracking-tighter uppercase group-hover:text-rose-400 transition-colors">
                                                            {user.nombre_completo || 'N/A'}
                                                        </p>
                                                        <p className="text-[10px] text-slate-500 font-bold tracking-widest">{user.email?.toUpperCase()}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-7">
                                                <div className="flex items-center gap-3 text-slate-400">
                                                    <MapPin className="h-4 w-4 text-rose-500/40" />
                                                    <span className="text-[11px] font-black uppercase tracking-[0.15em] italic">{user.ciudad || 'N/A'}, {user.estado || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-7">
                                                <div className="flex items-center gap-3 text-slate-500 font-bold">
                                                    <Calendar className="h-4 w-4 opacity-50" />
                                                    <span className="text-[11px] uppercase tracking-widest">{new Date(user.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-7">
                                                <span className="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border border-emerald-500/20 bg-emerald-500/5 text-emerald-500 inline-flex items-center gap-2.5">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                    ACTIVO
                                                </span>
                                            </td>
                                            <td className="px-10 py-7">
                                                <div className="flex items-center justify-center gap-4">
                                                    <motion.button
                                                        whileHover={{ scale: 1.1, backgroundColor: 'rgba(244, 63, 94, 0.1)' }}
                                                        className="p-3 bg-slate-950/40 border border-white/[0.05] rounded-xl text-slate-500 hover:text-rose-500 transition-all shadow-xl"
                                                    >
                                                        <Heart className="h-4.5 w-4.5" />
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                                                        className="p-3 bg-slate-950/40 border border-white/[0.05] rounded-xl text-slate-500 hover:text-white transition-all shadow-xl"
                                                    >
                                                        <MoreVertical className="h-4.5 w-4.5" />
                                                    </motion.button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-10 py-32 text-center">
                                            <div className="flex flex-col items-center gap-4 opacity-30">
                                                <Search className="h-16 w-16 text-slate-600 mb-2" />
                                                <p className="text-[14px] font-black text-slate-500 uppercase tracking-[0.4em]">Sin Resultados de Pacientes</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PatientsPage;
