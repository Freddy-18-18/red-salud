import React, { useState, useEffect, useRef } from 'react';
import {
    MessageSquare, Send, Plus, Search,
    AlertCircle, User as UserIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import type { SupportTicket, SupportMessage } from '@/types';
import { toast } from 'sonner';

const SupportPage: React.FC = () => {
    const { user } = useAuthStore();

    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [messages, setMessages] = useState<SupportMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Create Ticket Modal State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newTicketData, setNewTicketData] = useState({ subject: '', description: '', category: 'technical', priority: 'medium' });

    useEffect(() => {
        fetchTickets();
    }, []);

    useEffect(() => {
        if (selectedTicket) {
            fetchMessages(selectedTicket.id);
            // Subscribe to new messages
            const channel = supabase
                .channel(`ticket-${selectedTicket.id}`)
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'support_messages',
                    filter: `ticket_id=eq.${selectedTicket.id}`
                }, (payload) => {
                    const newMsg = payload.new as SupportMessage;
                    setMessages(prev => [...prev, newMsg]);
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [selectedTicket]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchTickets = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('support_tickets')
                .select('*, profiles:created_by(nombre_completo, email)')
                .order('updated_at', { ascending: false });

            if (error) throw error;
            setTickets(data || []);
        } catch (error) {
            console.error(error);
            toast.error('Error cargando tickets');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMessages = async (ticketId: string) => {
        try {
            const { data, error } = await supabase
                .from('support_messages')
                .select('*, profiles:sender_id(nombre_completo, avatar_url)')
                .eq('ticket_id', ticketId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setMessages(data || []);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { data, error } = await supabase
                .from('support_tickets')
                .insert({
                    ...newTicketData,
                    created_by: user?.id,
                    status: 'open'
                })
                .select()
                .single();

            if (error) throw error;

            setTickets([data, ...tickets]);
            setSelectedTicket(data);
            setIsCreateOpen(false);
            setNewTicketData({ subject: '', description: '', category: 'technical', priority: 'medium' });
            toast.success('Ticket creado exitosamente');
        } catch (error) {
            console.error(error);
            toast.error('Error al crear ticket');
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedTicket || !user) return;

        try {
            const { error } = await supabase
                .from('support_messages')
                .insert({
                    ticket_id: selectedTicket.id,
                    sender_id: user.id,
                    message: newMessage.trim()
                });

            if (error) throw error;
            setNewMessage('');

            // Optimistic update handled by subscription or re-fetch on error
        } catch (error) {
            console.error(error);
            toast.error('Error al enviar mensaje');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'in_progress': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'resolved': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'closed': return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
            default: return 'bg-slate-500/20 text-slate-400';
        }
    };

    return (
        <div className="flex h-[calc(100vh-6rem)] gap-6 max-w-[1600px] mx-auto pb-6">
            {/* Sidebar List */}
            <div className="w-96 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-display text-white">Soporte</h1>
                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="p-2 bg-white/[0.05] hover:bg-white/[0.1] rounded-full transition-colors text-white"
                    >
                        <Plus className="h-5 w-5" />
                    </button>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6e6e73]" />
                    <input
                        type="text"
                        placeholder="Buscar tickets..."
                        className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#0071e3]/50"
                    />
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {tickets.map(ticket => (
                        <div
                            key={ticket.id}
                            onClick={() => setSelectedTicket(ticket)}
                            className={`p-4 rounded-xl border transition-all cursor-pointer ${selectedTicket?.id === ticket.id
                                ? 'bg-[#0071e3]/10 border-[#0071e3]/50'
                                : 'bg-[#1c1c1e] border-white/[0.06] hover:border-white/[0.2]'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getStatusColor(ticket.status)} uppercase font-bold tracking-wider`}>
                                    {ticket.status.replace('_', ' ')}
                                </span>
                                <span className="text-[10px] text-[#86868b]">
                                    {new Date(ticket.updated_at).toLocaleDateString()}
                                </span>
                            </div>
                            <h3 className="text-sm font-semibold text-white mb-1 line-clamp-1">{ticket.subject}</h3>
                            <p className="text-xs text-[#86868b] line-clamp-2">{ticket.description}</p>
                        </div>
                    ))}
                    {tickets.length === 0 && !isLoading && (
                        <div className="text-center py-10 text-[#86868b] text-sm">
                            No hay tickets registrados
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 bg-[#1c1c1e] border border-white/[0.06] rounded-2xl overflow-hidden flex flex-col">
                {selectedTicket ? (
                    <>
                        {/* Header */}
                        <div className="p-6 border-b border-white/[0.06] flex items-center justify-between bg-[#1c1c1e]">
                            <div>
                                <h2 className="text-lg font-semibold text-white mb-1">{selectedTicket.subject}</h2>
                                <div className="flex items-center gap-3 text-xs text-[#86868b]">
                                    <span className="flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {selectedTicket.priority} Priority
                                    </span>
                                    <span>•</span>
                                    <span>{selectedTicket.category}</span>
                                    <span>•</span>
                                    <span>ID: {selectedTicket.id.slice(0, 8)}</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {/* Actions like resolve, close could go here */}
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-black/20">
                            {/* Original Description as first message */}
                            <div className="flex gap-4">
                                <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30 shrink-0">
                                    <UserIcon className="h-4 w-4 text-blue-400" />
                                </div>
                                <div className="flex-1 max-w-[80%]">
                                    <div className="flex items-baseline gap-2 mb-1">
                                        <span className="text-sm font-medium text-white">
                                            {selectedTicket.profiles?.nombre_completo || 'Usuario'}
                                        </span>
                                        <span className="text-[10px] text-[#86868b]">
                                            {new Date(selectedTicket.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="p-3 bg-white/[0.05] border border-white/[0.06] rounded-r-2xl rounded-bl-2xl text-sm text-slate-200 whitespace-pre-wrap">
                                        {selectedTicket.description}
                                    </div>
                                </div>
                            </div>

                            {messages.map(msg => {
                                const isMe = msg.sender_id === user?.id;
                                return (
                                    <div key={msg.id} className={`flex gap-4 ${isMe ? 'flex-row-reverse' : ''}`}>
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center border shrink-0 ${isMe ? 'bg-[#0071e3] border-transparent' : 'bg-slate-700 border-white/10'
                                            }`}>
                                            {msg.profiles?.avatar_url ? (
                                                <img src={msg.profiles.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
                                            ) : (
                                                <UserIcon className="h-4 w-4 text-white" />
                                            )}
                                        </div>
                                        <div className={`flex-1 max-w-[80%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                            <div className="flex items-baseline gap-2 mb-1">
                                                <span className="text-sm font-medium text-white">
                                                    {msg.profiles?.nombre_completo || 'Usuario'}
                                                </span>
                                                <span className="text-[10px] text-[#86868b]">
                                                    {new Date(msg.created_at).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className={`p-3 rounded-2xl text-sm whitespace-pre-wrap ${isMe
                                                ? 'bg-[#0071e3] text-white rounded-tr-none'
                                                : 'bg-white/[0.05] border border-white/[0.06] text-slate-200 rounded-tl-none'
                                                }`}>
                                                {msg.message}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSendMessage} className="p-4 bg-[#1c1c1e] border-t border-white/[0.06]">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    placeholder="Escribe un mensaje..."
                                    className="flex-1 bg-black/50 border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#0071e3]/50"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="p-3 bg-[#0071e3] hover:bg-[#0077ED] text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Send className="h-5 w-5" />
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-[#86868b]">
                        <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
                        <p className="font-medium">Selecciona un ticket para ver la conversación</p>
                    </div>
                )}
            </div>

            {/* Create Ticket Modal */}
            <AnimatePresence>
                {isCreateOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsCreateOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative w-full max-w-lg bg-[#1c1c1e] border border-white/[0.08] rounded-2xl p-6"
                        >
                            <h2 className="text-xl font-bold text-white mb-6">Nuevo Ticket de Soporte</h2>
                            <form onSubmit={handleCreateTicket} className="space-y-4">
                                <div>
                                    <label className="text-xs text-[#86868b] uppercase font-bold tracking-wider mb-1.5 block">Asunto</label>
                                    <input
                                        required
                                        type="text"
                                        value={newTicketData.subject}
                                        onChange={e => setNewTicketData({ ...newTicketData, subject: e.target.value })}
                                        className="w-full bg-white/[0.05] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#0071e3]"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-[#86868b] uppercase font-bold tracking-wider mb-1.5 block">Categoría</label>
                                        <select
                                            value={newTicketData.category}
                                            onChange={e => setNewTicketData({ ...newTicketData, category: e.target.value })}
                                            className="w-full bg-white/[0.05] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#0071e3]"
                                        >
                                            <option value="technical" className="bg-[#1c1c1e]">Técnico</option>
                                            <option value="access" className="bg-[#1c1c1e]">Accesos</option>
                                            <option value="billing" className="bg-[#1c1c1e]">Facturación</option>
                                            <option value="feature" className="bg-[#1c1c1e]">Solicitud</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-[#86868b] uppercase font-bold tracking-wider mb-1.5 block">Prioridad</label>
                                        <select
                                            value={newTicketData.priority}
                                            onChange={e => setNewTicketData({ ...newTicketData, priority: e.target.value })}
                                            className="w-full bg-white/[0.05] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#0071e3]"
                                        >
                                            <option value="low" className="bg-[#1c1c1e]">Baja</option>
                                            <option value="medium" className="bg-[#1c1c1e]">Media</option>
                                            <option value="high" className="bg-[#1c1c1e]">Alta</option>
                                            <option value="critical" className="bg-[#1c1c1e]">Crítica</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-[#86868b] uppercase font-bold tracking-wider mb-1.5 block">Descripción</label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={newTicketData.description}
                                        onChange={e => setNewTicketData({ ...newTicketData, description: e.target.value })}
                                        className="w-full bg-white/[0.05] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#0071e3] resize-none"
                                    />
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreateOpen(false)}
                                        className="px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-white/[0.05] transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 rounded-lg text-sm font-medium bg-[#0071e3] hover:bg-[#0077ED] text-white transition-colors"
                                    >
                                        Crear Ticket
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SupportPage;
