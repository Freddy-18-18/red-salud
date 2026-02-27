import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Stethoscope,
    Search,
    MoreHorizontal,
    Edit,
    Users,
    ArrowRight,
    Save,
    X,
    Info,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { SpecialtiesService, Specialty, Doctor } from '@/services/specialties.service';
import { toast } from 'sonner';

const SpecialtiesPage: React.FC = () => {
    const [specialties, setSpecialties] = useState<Specialty[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | null>(null);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loadingDoctors, setLoadingDoctors] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDoctorsDialogOpen, setIsDoctorsDialogOpen] = useState(false);

    // Edit Form State
    const [editDescription, setEditDescription] = useState('');
    const [editIcon, setEditIcon] = useState('');

    useEffect(() => {
        loadSpecialties();
    }, [searchQuery]);

    const loadSpecialties = async () => {
        setLoading(true);
        try {
            const result = await SpecialtiesService.getAllSpecialties({ search: searchQuery });
            setSpecialties(result.data);
        } catch (error) {
            console.error('Error loading specialties:', error);
            toast.error('No se pudieron cargar las especialidades. Verifica la conexión con la API.');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (specialty: Specialty) => {
        setSelectedSpecialty(specialty);
        setEditDescription(specialty.description || '');
        setEditIcon(specialty.icon || '');
        setIsEditDialogOpen(true);
    };

    const handleUpdate = async () => {
        if (!selectedSpecialty) return;

        try {
            await SpecialtiesService.updateSpecialty(selectedSpecialty.slug, {
                description: editDescription,
                icon: editIcon
            });
            toast.success('Especialidad actualizada correctamente');
            setIsEditDialogOpen(false);
            loadSpecialties();
        } catch (error) {
            console.error('Error updating specialty:', error);
            toast.error('Error al actualizar la especialidad');
        }
    };

    const handleViewDoctors = async (specialty: Specialty) => {
        setSelectedSpecialty(specialty);
        setIsDoctorsDialogOpen(true);
        setLoadingDoctors(true);
        try {
            const result = await SpecialtiesService.getSpecialtyDoctors(specialty.slug);
            setDoctors(result.data);
        } catch (error) {
            console.error('Error loading doctors:', error);
            toast.error('Error al cargar la lista de doctores');
        } finally {
            setLoadingDoctors(false);
        }
    };

    return (
        <div className="space-y-8 pb-12">
            {/* Header section with Stats */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3">
                        <Stethoscope className="h-8 w-8 text-blue-500" />
                        GÉSTION DE ESPECIALIDADES
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">
                        Control maestro de las 132 especialidades y su vinculación con el directorio médico
                    </p>
                </div>

                <div className="flex items-center gap-4 bg-white/[0.02] border border-white/[0.05] p-2 rounded-2xl">
                    <div className="px-4 py-2 text-center border-r border-white/5">
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Total</p>
                        <p className="text-xl font-bold text-white">{specialties.length}</p>
                    </div>
                    <div className="px-4 py-2 text-center">
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Activas</p>
                        <p className="text-xl font-bold text-emerald-500">{specialties.length}</p>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex items-center gap-4 bg-[#0A0A0A] border border-white/5 p-4 rounded-3xl shadow-2xl">
                <div className="flex-1 flex items-center gap-3 bg-white/[0.02] border border-white/5 px-4 py-3 rounded-2xl focus-within:border-blue-500/50 transition-all">
                    <Search className="h-4 w-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="BUSCAR POR NOMBRE O SLUG..."
                        className="bg-transparent border-none outline-none text-xs font-bold text-white placeholder:text-slate-700 w-full tracking-widest uppercase"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Grid of Specialties */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-48 bg-white/[0.02] border border-white/5 rounded-3xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {specialties.map((specialty) => (
                            <motion.div
                                key={specialty.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="group bg-[#0A0A0A] border border-white/5 rounded-3xl p-6 hover:border-blue-500/30 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.15)] relative overflow-hidden"
                            >
                                {/* Decorative Gradient */}
                                <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-all" />

                                <div className="flex items-start justify-between mb-4">
                                    <div className="h-12 w-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform duration-500">
                                        <Stethoscope className="h-6 w-6" />
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEdit(specialty)}
                                            className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleViewDoctors(specialty)}
                                            className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all"
                                        >
                                            <Users className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold text-white tracking-tight mb-1 group-hover:text-blue-400 transition-colors">
                                    {specialty.name}
                                </h3>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">
                                    /{specialty.slug}
                                </p>

                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-3 w-3 text-slate-600" />
                                        <span className="text-xs font-bold text-slate-400">{specialty.doctorCount} Médicos</span>
                                    </div>
                                    <div className="h-6 w-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Edit Dialog */}
            {isEditDialogOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl"
                    >
                        <div className="p-8 border-b border-white/5 flex items-center justify-between">
                            <h2 className="text-xl font-black text-white tracking-tighter uppercase">Editar Especialidad</h2>
                            <button onClick={() => setIsEditDialogOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-500">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Descripción Pública</label>
                                <textarea
                                    className="w-full bg-white/[0.02] border border-white/10 rounded-2xl p-4 text-sm text-white outline-none focus:border-blue-500/50 min-h-[120px]"
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    placeholder="Describe la especialidad..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">ID Icono Lucide</label>
                                <div className="flex items-center gap-3 bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3">
                                    <Info className="h-4 w-4 text-blue-500" />
                                    <input
                                        type="text"
                                        className="bg-transparent border-none outline-none text-sm text-white w-full"
                                        value={editIcon}
                                        onChange={(e) => setEditIcon(e.target.value)}
                                        placeholder="e.g. Activity, Heart, Eye..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-white/[0.01] flex justify-end gap-3">
                            <button
                                onClick={() => setIsEditDialogOpen(false)}
                                className="px-6 py-3 rounded-2xl text-xs font-black text-slate-400 hover:bg-white/5 transition-all"
                            >
                                CANCELAR
                            </button>
                            <button
                                onClick={handleUpdate}
                                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-2xl text-xs font-black text-white shadow-[0_10px_20px_-5px_rgba(59,130,246,0.3)] transition-all flex items-center gap-2"
                            >
                                <Save className="h-4 w-4" />
                                GUARDAR CAMBIOS
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Doctors List Dialog */}
            {isDoctorsDialogOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
                    >
                        <div className="p-8 border-b border-white/5 flex items-center justify-between shrink-0">
                            <div>
                                <h2 className="text-xl font-black text-white tracking-tighter uppercase">Directorio Médico</h2>
                                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{selectedSpecialty?.name}</p>
                            </div>
                            <button onClick={() => setIsDoctorsDialogOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-500">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            {loadingDoctors ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <div className="h-10 w-10 border-t-2 border-blue-500 rounded-full animate-spin" />
                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Sincronizando Directorio...</p>
                                </div>
                            ) : doctors.length === 0 ? (
                                <div className="text-center py-20">
                                    <Users className="h-12 w-12 text-slate-800 mx-auto mb-4" />
                                    <p className="text-slate-500 font-medium">No hay médicos registrados en esta especialidad todavía.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {doctors.map((doctor) => (
                                        <div key={doctor.id} className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-all">
                                            <div className="h-12 w-12 rounded-full border border-white/10 bg-slate-900 flex items-center justify-center overflow-hidden shrink-0">
                                                {doctor.avatar_url ? (
                                                    <img src={doctor.avatar_url} alt={doctor.full_name} className="h-full w-full object-cover" />
                                                ) : (
                                                    <Users className="h-5 w-5 text-slate-600" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-bold text-white truncate">{doctor.full_name}</h4>
                                                <p className="text-[10px] text-slate-500 truncate font-medium uppercase tracking-tighter">{doctor.email}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {doctor.sacs_verificado ? (
                                                    <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full">
                                                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                                        <span className="text-[9px] font-black text-emerald-500">SACS</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-full">
                                                        <AlertCircle className="h-3 w-3 text-amber-500" />
                                                        <span className="text-[9px] font-black text-amber-500">NO VERIF.</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-8 bg-white/[0.01] shrink-0">
                            <button
                                onClick={() => setIsDoctorsDialogOpen(false)}
                                className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black text-slate-400 tracking-widest transition-all"
                            >
                                CERRAR DIRECTORIO
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default SpecialtiesPage;
