/**
 * @file messages-widget.tsx
 * @description Widget de mensajes recientes con datos reales de Supabase.
 * Muestra las conversaciones recientes con pacientes y conteo de no leídos.
 * 
 * @module Dashboard/Widgets
 */

"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MessageSquare, ChevronRight, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { WidgetWrapper } from "../widget-wrapper";
import { useDashboardData } from "@/hooks/use-dashboard-data";

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Formatea la fecha relativa de un mensaje.
 */
function formatMessageTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Ahora";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays === 1) return "Ayer";
    return date.toLocaleDateString("es-VE", { day: "numeric", month: "short" });
}

/**
 * Obtiene las iniciales de un nombre.
 */
function getInitials(name: string): string {
    return name
        .split(" ")
        .map(n => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

// ============================================================================
// TIPOS
// ============================================================================

interface MessagesWidgetProps {
    /** ID del médico */
    doctorId?: string;
    /** Si está siendo arrastrado */
    isDragging?: boolean;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Widget de mensajes recientes.
 * Muestra las conversaciones más recientes con pacientes.
 * 
 * @example
 * <MessagesWidget doctorId="uuid-del-doctor" />
 */
export function MessagesWidget({
    doctorId,
    isDragging
}: MessagesWidgetProps) {
    const router = useRouter();

    // Obtener datos reales del dashboard
    const { conversations, stats, isLoading } = useDashboardData(doctorId);

    // Total de mensajes no leídos
    const totalUnread = stats.unreadMessages;

    // Handler para abrir una conversación
    const handleOpenConversation = (conversationId: string) => {
        router.push(`/dashboard/medico/mensajeria?chat=${conversationId}`);
    };

    // Handler para nueva conversación
    const handleNewConversation = () => {
        router.push("/dashboard/medico/mensajeria/nueva");
    };

    return (
        <WidgetWrapper
            id="messages"
            title="Mensajes"
            icon={
                <div className="relative">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    {totalUnread > 0 && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    )}
                </div>
            }
            isDragging={isDragging}
            showControls={false}
        >
            <div className="space-y-3">
                {/* Estado de carga */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <Badge variant="secondary" className="text-[10px]">
                                {totalUnread} sin leer
                            </Badge>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs h-6 gap-1"
                                onClick={handleNewConversation}
                            >
                                <Send className="h-3 w-3" />
                                Nuevo
                            </Button>
                        </div>

                        {/* Messages List */}
                        <div className="space-y-2">
                            {conversations.length > 0 ? (
                                conversations.map((conversation, index) => (
                                    <motion.div
                                        key={conversation.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={cn(
                                            "flex items-center gap-2 p-2 rounded-lg",
                                            "hover:bg-muted/50 transition-colors cursor-pointer",
                                            conversation.unreadCount > 0 && "bg-primary/5"
                                        )}
                                        onClick={() => handleOpenConversation(conversation.id)}
                                    >
                                        {/* Avatar */}
                                        <div className="relative">
                                            <Avatar className="h-8 w-8">
                                                {conversation.patientAvatar ? (
                                                    <AvatarImage
                                                        src={conversation.patientAvatar}
                                                        alt={conversation.patientName}
                                                    />
                                                ) : null}
                                                <AvatarFallback className="text-xs bg-gradient-to-br from-primary/20 to-secondary/20">
                                                    {getInitials(conversation.patientName)}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className={cn(
                                                    "text-xs font-medium truncate",
                                                    conversation.unreadCount > 0 && "text-foreground"
                                                )}>
                                                    {conversation.patientName}
                                                </p>
                                                <span className="text-[10px] text-muted-foreground flex-shrink-0">
                                                    {formatMessageTime(conversation.lastMessageTime)}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground truncate">
                                                {conversation.lastMessage}
                                            </p>
                                        </div>

                                        {/* Unread Badge */}
                                        {conversation.unreadCount > 0 && (
                                            <Badge className="h-4 min-w-[16px] text-[10px] px-1">
                                                {conversation.unreadCount}
                                            </Badge>
                                        )}
                                    </motion.div>
                                ))
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-6 text-muted-foreground"
                                >
                                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No hay conversaciones</p>
                                    <Button
                                        variant="link"
                                        className="text-xs mt-1"
                                        onClick={handleNewConversation}
                                    >
                                        Iniciar una conversación
                                    </Button>
                                </motion.div>
                            )}
                        </div>

                        {/* View All */}
                        {conversations.length > 0 && (
                            <Button variant="outline" className="w-full text-xs h-7" asChild>
                                <a href="/dashboard/medico/mensajeria">
                                    Ver todos los mensajes
                                    <ChevronRight className="h-3 w-3 ml-1" />
                                </a>
                            </Button>
                        )}
                    </>
                )}
            </div>
        </WidgetWrapper>
    );
}
