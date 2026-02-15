import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Stethoscope,
    Search,
    RefreshCw,
    MapPin,
    Calendar,
    MoreVertical,
    ArrowLeft,
    Filter,
    Award,
    ShieldCheck,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    FileText,
    Mail,
    Phone,
    User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getDoctors, type DoctorProfile } from '../../services/supabase.queries';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Profile {
    id: string;
    nombre_completo: string | null;
    email: string | null;
    role: 'medico';
    estado: string | null;
    ciudad: string | null;
    created_at: string;
}

interface VerificationRequest {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    status: string;
    created_at: string;
    metadata: {
        cedula?: string;
        especialidad?: string;
        anos_experiencia?: number;
        profile_id?: string;
        documentos_pendientes?: string[];
    } | null;
}

const DoctorsPage: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'list' | 'verifications'>('list');
    const [users, setUsers] = useState<DoctorProfile[]>([]);
    const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
    const premiumEasing: any = [0.16, 1, 0.3, 1];

    useEffect(() => {
        if (activeTab === 'list') {
            fetchDoctors();
        } else {
            fetchVerificationRequests();
        }
    }, [activeTab]);

    const fetchDoctors = async () => {
        setLoading(true);
        try {
            const data = await getDoctors();
            console.log('[DoctorsPage] Doctors received:', data.length);
            setUsers(data);

            if (data.length === 0) {
                console.warn('[DoctorsPage] No doctors found in database');
            }
        } catch (error) {
            console.error('[DoctorsPage] Error fetching doctors:', error);
            toast.error('Error al cargar el escuadrón médico');
        } finally {
            setLoading(false);
        }
    };

    const fetchVerificationRequests = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('support_tickets')
                .select('*')
                .eq('ticket_type', 'verification_medico')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setVerificationRequests(data || []);
        } catch (error) {
            console.error('[DoctorsPage] Error fetching verification requests:', error);
            toast.error('Error al cargar solicitudes de verificación');
        } finally {
            setLoading(false);
        }
    };

    const handleApproveVerification = async (requestId: string) => {
        try {
            const request = verificationRequests.find(r => r.id === requestId);
            if (!request || !request.metadata?.profile_id) {
                throw new Error('Solicitud inválida');
            }

            // Actualizar el perfil del médico como verificado
            const { error: doctorError } = await supabase
                .from('doctor_details')
                .update({
                    verified: true,
                })
                .eq('profile_id', request.metadata.profile_id);

            if (doctorError) throw doctorError;

            // Actualizar el perfil principal
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    cedula_verificada: true,
                })
                .eq('id', request.metadata.profile_id);

            if (profileError) throw profileError;

            // Actualizar el ticket
            const { error: ticketError } = await supabase
                .from('support_tickets')
                .update({ status: 'APROBADO' })
                .eq('id', requestId);

            if (ticketError) throw ticketError;

            toast.success('Profesional verificado exitosamente');
            fetchVerificationRequests();
            setSelectedRequest(null);
        } catch (error: any) {
            console.error('[DoctorsPage] Error approving verification:', error);
            toast.error(error.message || 'Error al aprobar verificación');
        }
    };

    const handleRejectVerification = async (requestId: string) => {
        try {
            const { error } = await supabase
                .from('support_tickets')
                .update({ status: 'RECHAZADO' })
                .eq('id', requestId);

            if (error) throw error;

            toast.success('Solicitud rechazada');
            fetchVerificationRequests();
            setSelectedRequest(null);
        } catch (error: any) {
            console.error('[DoctorsPage] Error rejecting verification:', error);
            toast.error(error.message || 'Error al rechazar verificación');
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
                        <div className="h-px w-12 bg-blue-500/50" />
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">Escuadrón Médico Corporativo</span>
                    </div>
                    <h1 className="text-6xl font-black text-white tracking-tighter italic uppercase group transition-all">
                        CENTRAL DE <span className="text-blue-500 group-hover:text-blue-400 transition-colors">DOCTORES</span>
                    </h1>
                    <p className="text-slate-500 font-bold text-sm tracking-wide max-w-xl uppercase leading-relaxed">
                        Administración de profesionales de la salud, validación de licencias y monitoreo de actividad clínica.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: premiumEasing }}
                    className="flex bg-slate-900/40 p-4 rounded-[2.5rem] border border-white/[0.05] backdrop-blur-3xl shadow-2xl gap-8 px-10 items-center"
                >
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                            <Award className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Profesionales</p>
                            <p className="text-2xl font-black text-white italic">{users.length}</p>
                        </div>
                    </div>
                    <div className="h-10 w-px bg-white/10" />
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nodos Verificados</p>
                            <p className="text-2xl font-black text-white italic">100%</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Tab Switcher */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex gap-3 bg-slate-900/40 backdrop-blur-2xl border border-white/[0.05] rounded-[2rem] p-3"
            >
                <button
                    onClick={() => setActiveTab('list')}
                    className={`flex-1 px-8 py-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all ${
                        activeTab === 'list'
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]'
                    }`}
                >
                    <Stethoscope className="h-4 w-4 inline-block mr-2" />
                    Médicos Activos
                </button>
                <button
                    onClick={() => setActiveTab('verifications')}
                    className={`flex-1 px-8 py-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all relative ${
                        activeTab === 'verifications'
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]'
                    }`}
                >
                    <Clock className="h-4 w-4 inline-block mr-2" />
                    Solicitudes de Verificación
                    {verificationRequests.filter(r => r.status === 'NUEVO').length > 0 && (
                        <span className="ml-2 px-2 py-0.5 rounded-full bg-yellow-500 text-black text-[9px] font-bold">
                            {verificationRequests.filter(r => r.status === 'NUEVO').length}
                        </span>
                    )}
                </button>
            </motion.div>

            {/* Content based on active tab */}
            {activeTab === 'list' ? (
                <>
                    {/* Tactical Control Bar */}
            <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/[0.05] rounded-[2rem] p-6 flex flex-col md:flex-row gap-6 items-center shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-30" />

                <div className="relative flex-1 group w-full">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="BUSCAR DOCTOR POR NOMBRE O ESPECIALIDAD..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/[0.02] border border-white/[0.05] rounded-2xl py-4 pl-16 pr-6 text-xs font-black uppercase tracking-widest text-white placeholder:text-slate-700 focus:outline-none focus:border-blue-500/40 focus:bg-white/[0.04] transition-all"
                    />
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={fetchDoctors}
                        className="p-4 bg-slate-950/60 border border-white/[0.03] rounded-2xl text-slate-500 hover:text-blue-500 hover:border-blue-500/30 transition-all flex items-center gap-3 font-black uppercase tracking-widest text-[10px]"
                    >
                        <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                        Sincronizar
                    </motion.button>
                    <button className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-900/20 transition-all flex items-center gap-3">
                        <Filter className="h-5 w-5" />
                        Filtros Avanzados
                    </button>
                </div>
            </div>

            {/* Doctors Grid/Table */}
            <div className="bg-slate-900/20 backdrop-blur-xl border border-white/[0.03] rounded-[3rem] overflow-hidden shadow-2xl relative group">
                <div className="absolute inset-0 bg-blue-500/[0.01] pointer-events-none" />

                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/[0.05] bg-white/[0.02]">
                                <th className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">Profesional</th>
                                <th className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">Ubicación Táctica</th>
                                <th className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">Fecha de Alta</th>
                                <th className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">Estado Operativo</th>
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
                                                        className="absolute inset-0 w-1/2 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)]"
                                                    />
                                                </div>
                                                <p className="text-[12px] font-black text-slate-500 uppercase tracking-[0.5em] animate-pulse">Sincronizando Escuadrón Médico...</p>
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
                                            className="group hover:bg-blue-600/[0.03] transition-all cursor-default"
                                        >
                                            <td className="px-10 py-7">
                                                <div className="flex items-center gap-5">
                                                    <div className="h-14 w-14 rounded-2xl bg-slate-950/80 border border-white/[0.05] flex items-center justify-center text-slate-600 group-hover:text-blue-500 group-hover:border-blue-500/30 transition-all relative overflow-hidden">
                                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        <Stethoscope className="h-6 w-6 relative z-10" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-base font-black text-white tracking-tighter uppercase group-hover:text-blue-400 transition-colors">
                                                            {user.nombre_completo || 'SIN IDENTIFICAR'}
                                                        </p>
                                                        <p className="text-[10px] text-slate-500 font-bold tracking-widest">{user.email?.toUpperCase()}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-7">
                                                <div className="flex items-center gap-3 text-slate-400">
                                                    <MapPin className="h-4 w-4 text-blue-500/40" />
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
                                                <span className="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border border-blue-500/20 bg-blue-500/5 text-blue-500 inline-flex items-center gap-2.5">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                                                    OPERATIVO
                                                </span>
                                            </td>
                                            <td className="px-10 py-7">
                                                <div className="flex items-center justify-center gap-4">
                                                    <motion.button
                                                        whileHover={{ scale: 1.1, backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                                                        className="p-3 bg-slate-950/40 border border-white/[0.05] rounded-xl text-slate-500 hover:text-blue-500 transition-all shadow-xl"
                                                    >
                                                        <Award className="h-4.5 w-4.5" />
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
                                                <Stethoscope className="h-16 w-16 text-slate-600 mb-2" />
                                                <p className="text-[14px] font-black text-slate-500 uppercase tracking-[0.4em]">Sin Resultados de Doctores</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>
                </>
            ) : (
                /* Verification Requests View */
                <div className="space-y-6">
                    {loading ? (
                        <div className="py-40 text-center">
                            <div className="flex flex-col items-center gap-6">
                                <div className="h-1 w-48 bg-slate-800 rounded-full overflow-hidden relative">
                                    <motion.div
                                        animate={{ left: ['-100%', '100%'] }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                                        className="absolute inset-0 w-1/2 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)]"
                                    />
                                </div>
                                <p className="text-[12px] font-black text-slate-500 uppercase tracking-[0.5em] animate-pulse">Cargando Solicitudes...</p>
                            </div>
                        </div>
                    ) : verificationRequests.length === 0 ? (
                        <div className="py-40 text-center">
                            <div className="flex flex-col items-center gap-4 opacity-30">
                                <CheckCircle2 className="h-16 w-16 text-green-600 mb-2" />
                                <p className="text-[14px] font-black text-slate-500 uppercase tracking-[0.4em]">No hay solicitudes pendientes</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {verificationRequests.map((request, idx) => (
                                <motion.div
                                    key={request.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                                    className="bg-slate-900/40 backdrop-blur-2xl border border-white/[0.05] rounded-[2rem] p-8 hover:border-blue-500/20 transition-all"
                                >
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-start gap-4">
                                            <div className="h-16 w-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                                <User className="h-8 w-8 text-blue-500" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-white uppercase tracking-tighter">{request.name}</h3>
                                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">
                                                    {request.metadata?.especialidad || 'Especialidad no especificada'}
                                                </p>
                                                <p className="text-[10px] text-slate-600 uppercase tracking-widest mt-2">
                                                    Solicitado: {new Date(request.created_at).toLocaleDateString('es-VE', { 
                                                        year: 'numeric', month: 'long', day: 'numeric' 
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] ${
                                            request.status === 'NUEVO' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                                            request.status === 'APROBADO' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                                            'bg-red-500/10 text-red-500 border border-red-500/20'
                                        }`}>
                                            {request.status}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-6 bg-white/[0.02] rounded-xl border border-white/[0.03]">
                                        <div>
                                            <p className="text-[10px] text-slate-600 uppercase tracking-widest mb-1">Cédula</p>
                                            <p className="text-sm font-bold text-white">{request.metadata?.cedula || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-600 uppercase tracking-widest mb-1">Email</p>
                                            <p className="text-sm font-bold text-white truncate">{request.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-600 uppercase tracking-widest mb-1">Teléfono</p>
                                            <p className="text-sm font-bold text-white">{request.phone || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-600 uppercase tracking-widest mb-1">Experiencia</p>
                                            <p className="text-sm font-bold text-white">{request.metadata?.anos_experiencia || 0} años</p>
                                        </div>
                                    </div>

                                    {request.metadata?.documentos_pendientes && (
                                        <div className="mb-6 p-6 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                                            <div className="flex items-center gap-2 mb-3">
                                                <FileText className="h-4 w-4 text-amber-500" />
                                                <p className="text-xs font-black text-amber-500 uppercase tracking-wider">Documentos Requeridos</p>
                                            </div>
                                            <ul className="space-y-2">
                                                {request.metadata.documentos_pendientes.map((doc: string, i: number) => (
                                                    <li key={i} className="text-xs text-slate-400 flex items-center gap-2">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                                        {doc}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {request.status === 'NUEVO' && (
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleApproveVerification(request.id)}
                                                className="flex-1 px-6 py-4 bg-green-600 hover:bg-green-500 text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle2 className="h-4 w-4" />
                                                Aprobar Verificación
                                            </button>
                                            <button
                                                onClick={() => handleRejectVerification(request.id)}
                                                className="flex-1 px-6 py-4 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
                                            >
                                                <XCircle className="h-4 w-4" />
                                                Rechazar
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DoctorsPage;
