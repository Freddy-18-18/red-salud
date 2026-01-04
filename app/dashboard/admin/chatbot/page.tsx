"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThumbsUp, ThumbsDown, MessageSquare, Activity, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatbotStats {
    metrics: {
        total: number;
        positive: number;
        negative: number;
        resolutionRate: number;
    };
    recentFeedback: {
        id: number;
        message_content: string;
        response_content: string;
        is_positive: boolean;
        created_at: string;
        page_url: string;
    }[];
}

export default function ChatbotAnalyticsPage() {
    const [stats, setStats] = useState<ChatbotStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch("/api/admin/chatbot-stats");
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (error) {
                console.error("Failed to fetch stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!stats) {
        return <div className="p-8">Error al cargar estadísticas.</div>;
    }

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Analítica del Chatbot</h1>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Activity className="h-4 w-4" />
                    <span>Actualizado en tiempo real</span>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Interacciones Totales</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.metrics.total}</div>
                        <p className="text-xs text-muted-foreground">Feedbacks registrados</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tasa de Resolución</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.metrics.resolutionRate}%</div>
                        <p className="text-xs text-muted-foreground">Satisfacción del usuario</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Feedback Positivo</CardTitle>
                        <ThumbsUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.metrics.positive}</div>
                        <p className="text-xs text-muted-foreground">Respuestas útiles</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Feedback Negativo</CardTitle>
                        <ThumbsDown className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.metrics.negative}</div>
                        <p className="text-xs text-muted-foreground">Requiere revisión</p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Feedback List */}
            <Card>
                <CardHeader>
                    <CardTitle>Feedback Reciente</CardTitle>
                    <CardDescription>Últimas evaluaciones de usuarios en las páginas públicas.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {stats.recentFeedback.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No hay feedback reciente.</p>
                        ) : (
                            stats.recentFeedback.map((item) => (
                                <div key={item.id} className="flex items-start gap-4 p-4 border rounded-lg bg-muted/50">
                                    <div className={cn(
                                        "p-2 rounded-full shrink-0",
                                        item.is_positive ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                                    )}>
                                        {item.is_positive ? <ThumbsUp className="h-4 w-4" /> : <ThumbsDown className="h-4 w-4" />}
                                    </div>
                                    <div className="space-y-1 flex-1">
                                        <div className="flex justify-between items-start">
                                            <p className="font-medium text-sm">Usuario preguntó:</p>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(item.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground italic">"{item.message_content}"</p>
                                        
                                        <div className="mt-2 pt-2 border-t border-dashed">
                                            <p className="font-medium text-sm">Bot respondió:</p>
                                            <p className="text-sm text-muted-foreground line-clamp-2">{item.response_content}</p>
                                        </div>
                                        
                                        <div className="mt-2 flex gap-2">
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-background border">
                                                Página: {item.page_url}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
