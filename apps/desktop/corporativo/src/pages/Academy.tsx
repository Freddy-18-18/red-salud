import React, { useState, useEffect } from 'react';
import {
    BookOpen, Play, Plus, Clock, Search,
    Award, X, MonitorPlay
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import type { AcademyModule, UserRole } from '@/types';
import { toast } from 'sonner';

// ============================================
// CREATE/EDIT MODULE MODAL
// ============================================

interface ModuleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    moduleToEdit?: AcademyModule | null;
}

const ModuleModal: React.FC<ModuleModalProps> = ({ isOpen, onClose, onSuccess, moduleToEdit }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        video_url: '',
        thumbnail_url: '',
        category: 'general',
        duration_minutes: 15,
        target_roles: [] as string[]
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (moduleToEdit) {
            setFormData({
                title: moduleToEdit.title,
                description: moduleToEdit.description || '',
                video_url: moduleToEdit.video_url || '',
                thumbnail_url: moduleToEdit.thumbnail_url || '',
                category: moduleToEdit.category,
                duration_minutes: moduleToEdit.duration_minutes,
                target_roles: moduleToEdit.target_roles
            });
        } else {
            setFormData({
                title: '', description: '', video_url: '', thumbnail_url: '',
                category: 'general', duration_minutes: 15, target_roles: []
            });
        }
    }, [moduleToEdit, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const user = (await supabase.auth.getUser()).data.user;
            if (!user) throw new Error('No authenticated');

            const payload = {
                ...formData,
                created_by: user.id
            };

            if (moduleToEdit) {
                const { error } = await supabase
                    .from('academy_modules')
                    .update(payload)
                    .eq('id', moduleToEdit.id);
                if (error) throw error;
                toast.success('Módulo actualizado');
            } else {
                const { error } = await supabase
                    .from('academy_modules')
                    .insert(payload);
                if (error) throw error;
                toast.success('Módulo creado');
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleRole = (role: string) => {
        setFormData(prev => ({
            ...prev,
            target_roles: prev.target_roles.includes(role)
                ? prev.target_roles.filter(r => r !== role)
                : [...prev.target_roles, role]
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-2xl bg-[#1c1c1e] border border-white/[0.08] rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white">
                        {moduleToEdit ? 'Editar Contenido' : 'Nuevo Contenido'}
                    </h2>
                    <button onClick={onClose}><X className="h-5 w-5 text-[#6e6e73]" /></button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-overline">Título</label>
                        <input
                            required
                            type="text"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-[#0071e3]/50"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-overline">Categoría</label>
                            <select
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-[#0071e3]/50"
                            >
                                <option value="general" className="bg-[#1c1c1e]">General</option>
                                <option value="clinical" className="bg-[#1c1c1e]">Clínico</option>
                                <option value="system" className="bg-[#1c1c1e]">Sistemas</option>
                                <option value="compliance" className="bg-[#1c1c1e]">Cumplimiento</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-overline">Duración (min)</label>
                            <input
                                type="number"
                                value={formData.duration_minutes}
                                onChange={e => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-[#0071e3]/50"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-overline">Video URL</label>
                        <input
                            type="url"
                            value={formData.video_url}
                            onChange={e => setFormData({ ...formData, video_url: e.target.value })}
                            placeholder="https://..."
                            className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-[#0071e3]/50"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-overline">Roles Objetivo</label>
                        <div className="flex flex-wrap gap-2">
                            {['medico', 'farmacia', 'admin', 'rrhh'].map(role => (
                                <button
                                    key={role}
                                    type="button"
                                    onClick={() => toggleRole(role)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${formData.target_roles.includes(role)
                                        ? 'bg-[#0071e3] text-white'
                                        : 'bg-white/[0.05] text-[#86868b] hover:bg-white/[0.1]'
                                        }`}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-overline">Descripción</label>
                        <textarea
                            rows={3}
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-[#0071e3]/50 resize-none"
                        />
                    </div>
                </form>

                <div className="p-6 border-t border-white/[0.06]">
                    <button
                        disabled={isSubmitting}
                        onClick={handleSubmit}
                        className="w-full apple-button py-3 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? 'Guardando...' : 'Guardar Contenido'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

// ============================================
// MAIN PAGE
// ============================================

const AcademyPage: React.FC = () => {
    const [modules, setModules] = useState<AcademyModule[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedModule, setSelectedModule] = useState<AcademyModule | null>(null);

    useEffect(() => {
        fetchModules();
    }, []);

    const fetchModules = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('academy_modules')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setModules(data || []);
        } catch (error: any) {
            toast.error('Error al cargar cursos');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredModules = modules.filter(m => {
        const matchesCategory = filter === 'all' || m.category === filter;
        const matchesSearch = m.title.toLowerCase().includes(search.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto pb-16">
            <ModuleModal
                isOpen={isCreateModalOpen || !!selectedModule}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setSelectedModule(null);
                }}
                onSuccess={fetchModules}
                moduleToEdit={selectedModule}
            />

            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col lg:flex-row lg:items-end justify-between gap-6"
            >
                <div className="space-y-2">
                    <p className="text-overline">Formación Continua</p>
                    <h1 className="text-display text-white">Academy</h1>
                    <p className="text-body text-[#86868b] max-w-lg">
                        Centro de capacitación y recursos para la red de salud.
                    </p>
                </div>

                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6e6e73]" strokeWidth={1.5} />
                        <input
                            type="text"
                            placeholder="Buscar cursos..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="bg-white/[0.03] border border-white/[0.06] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white w-64 focus:outline-none focus:border-[#0071e3]/50 transition-all"
                        />
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="apple-button px-4 py-2 flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" strokeWidth={1.5} />
                        Nuevo Contenido
                    </button>
                </div>
            </motion.header>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {[
                    { id: 'all', label: 'Todos' },
                    { id: 'general', label: 'General' },
                    { id: 'clinical', label: 'Clínico' },
                    { id: 'system', label: 'Sistemas' },
                    { id: 'compliance', label: 'Cumplimiento' },
                ].map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setFilter(cat.id)}
                        className={`px-4 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap ${filter === cat.id
                            ? 'bg-white text-black'
                            : 'bg-white/[0.05] text-[#86868b] hover:bg-white/[0.1] hover:text-white'
                            }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Content Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="aspect-video bg-white/[0.02] rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : filteredModules.length === 0 ? (
                <div className="py-20 text-center border border-white/[0.06] rounded-3xl border-dashed">
                    <BookOpen className="h-10 w-10 text-[#3a3a3c] mx-auto mb-4" />
                    <p className="text-white font-medium">No hay contenido disponible</p>
                    <p className="text-caption">Ajusta los filtros o crea nuevo contenido</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredModules.map((module, i) => (
                        <motion.div
                            key={module.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="group relative bg-[#1c1c1e] border border-white/[0.08] rounded-2xl overflow-hidden hover:border-white/[0.2] transition-colors cursor-pointer"
                            onClick={() => setSelectedModule(module)}
                        >
                            {/* Thumbnail Placeholder */}
                            <div className="aspect-video bg-gradient-to-br from-[#0071e3]/20 to-[#5e5ce6]/20 flex items-center justify-center relative group-hover:scale-105 transition-transform duration-500">
                                {module.category === 'clinical' && <Award className="h-10 w-10 text-white/20" />}
                                {module.category === 'system' && <MonitorPlay className="h-10 w-10 text-white/20" />}
                                {module.category === 'general' && <BookOpen className="h-10 w-10 text-white/20" />}

                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                        <Play className="h-5 w-5 text-white ml-1" fill="currentColor" />
                                    </div>
                                </div>

                                <div className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-medium text-white flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {module.duration_minutes} min
                                </div>
                            </div>

                            <div className="p-5 space-y-3">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <span className={`text-[10px] uppercase font-bold tracking-wider mb-1 block ${module.category === 'clinical' ? 'text-[#30d158]' :
                                            module.category === 'system' ? 'text-[#0071e3]' :
                                                'text-[#86868b]'
                                            }`}>
                                            {module.category}
                                        </span>
                                        <h3 className="text-base font-semibold text-white leading-tight line-clamp-2">
                                            {module.title}
                                        </h3>
                                    </div>
                                </div>

                                <p className="text-sm text-[#86868b] line-clamp-2">
                                    {module.description || 'Sin descripción disponible.'}
                                </p>

                                <div className="pt-3 border-t border-white/[0.06] flex items-center gap-2">
                                    {module.target_roles?.slice(0, 3).map(role => (
                                        <span key={role} className="px-2 py-0.5 rounded text-[10px] bg-white/[0.05] text-[#86868b]">
                                            {role}
                                        </span>
                                    ))}
                                    {(module.target_roles?.length || 0) > 3 && (
                                        <span className="text-[10px] text-[#86868b]">+{module.target_roles!.length - 3}</span>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AcademyPage;
