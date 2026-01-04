"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
    Zap,
    Calendar,
    Users,
    FileText,
    Video,
    MessageSquare,
    Pill,
    Settings,
    FlaskConical,
    TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WidgetWrapper } from "../widget-wrapper";

interface QuickAction {
    id: string;
    label: string;
    icon: React.ReactNode;
    href: string;
    color: string;
    description?: string;
}

const quickActions: QuickAction[] = [
    {
        id: "agenda",
        label: "Agenda",
        icon: <Calendar className="h-4 w-4" />,
        href: "/dashboard/medico/citas",
        color: "from-blue-500 to-blue-600",
        description: "Ver citas",
    },
    {
        id: "pacientes",
        label: "Pacientes",
        icon: <Users className="h-4 w-4" />,
        href: "/dashboard/medico/pacientes",
        color: "from-emerald-500 to-emerald-600",
        description: "Lista de pacientes",
    },
    {
        id: "recetas",
        label: "Recetas",
        icon: <FileText className="h-4 w-4" />,
        href: "/dashboard/medico/recetas",
        color: "from-orange-500 to-orange-600",
        description: "Prescripciones",
    },
    {
        id: "telemedicina",
        label: "Video",
        icon: <Video className="h-4 w-4" />,
        href: "/dashboard/medico/telemedicina",
        color: "from-teal-500 to-teal-600",
        description: "Consultas online",
    },
    {
        id: "mensajes",
        label: "Mensajes",
        icon: <MessageSquare className="h-4 w-4" />,
        href: "/dashboard/medico/mensajeria",
        color: "from-purple-500 to-purple-600",
        description: "Chat con pacientes",
    },
    {
        id: "laboratorio",
        label: "Lab",
        icon: <FlaskConical className="h-4 w-4" />,
        href: "/dashboard/medico/laboratorio",
        color: "from-pink-500 to-pink-600",
        description: "Órdenes de lab",
    },
];

interface QuickActionsWidgetProps {
    isDragging?: boolean;
}

export function QuickActionsWidget({
    isDragging
}: QuickActionsWidgetProps) {
    const router = useRouter();

    return (
        <WidgetWrapper
            id="quick-actions"
            title="Acciones Rápidas"
            icon={<Zap className="h-4 w-4 text-primary" />}
            isDragging={isDragging}
            showControls={false}
        >
            <div className="grid grid-cols-3 gap-2">
                {quickActions.map((action, index) => (
                    <motion.button
                        key={action.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.push(action.href)}
                        className={cn(
                            "flex flex-col items-center justify-center p-3 rounded-xl",
                            "bg-gradient-to-br from-muted/50 to-muted/20",
                            "dark:from-muted/80 dark:to-muted/50",
                            "border border-border/30 dark:border-border/50",
                            "hover:shadow-md transition-all duration-200",
                            "group"
                        )}
                    >
                        {/* Icon */}
                        <div className={cn(
                            "flex items-center justify-center w-8 h-8 rounded-lg mb-1.5",
                            "bg-gradient-to-br text-white",
                            action.color,
                            "group-hover:scale-110 transition-transform"
                        )}>
                            {action.icon}
                        </div>

                        {/* Label */}
                        <span className="text-[11px] font-medium text-foreground">
                            {action.label}
                        </span>
                    </motion.button>
                ))}
            </div>
        </WidgetWrapper>
    );
}
