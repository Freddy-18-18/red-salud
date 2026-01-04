/**
 * @file billing-section.tsx
 * @description Sección de facturación y pagos para la página de configuración.
 * Gestiona métodos de pago e historial de transacciones.
 * @module Configuracion
 * 
 * @example
 * <BillingSection />
 */

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    CreditCard,
    Plus,
    Edit2,
    Check,
    Clock,
    Download,
    Loader2,
    DollarSign,
    Receipt
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";

/**
 * Representa un método de pago del usuario
 */
interface PaymentMethod {
    id: string;
    card_brand: string;
    last_four: string;
    exp_month: number;
    exp_year: number;
    is_default: boolean;
}

/**
 * Representa una transacción del usuario
 */
interface Transaction {
    id: string;
    description: string;
    amount: number;
    status: "paid" | "pending" | "failed";
    invoice_number?: string;
    created_at: string;
}

/**
 * Componente de sección de facturación para la página de configuración.
 * Gestiona métodos de pago e historial de transacciones.
 */
export function BillingSection() {
    const [loading, setLoading] = useState(true);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    /** Carga datos de facturación */
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Cargar métodos de pago
            const { data: methodsData } = await supabase
                .from("payment_methods")
                .select("*")
                .eq("user_id", user.id)
                .order("is_default", { ascending: false });

            if (methodsData) {
                setPaymentMethods(methodsData);
            }

            // Cargar transacciones
            const { data: transactionsData } = await supabase
                .from("transactions")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(10);

            if (transactionsData) {
                setTransactions(transactionsData);
            }
        } catch (error) {
            console.error("Error loading billing data:", error);
        } finally {
            setLoading(false);
        }
    };

    /** Calcula el total gastado */
    const totalSpent = transactions
        .filter((t) => t.status === "paid")
        .reduce((sum, t) => sum + (t.amount || 0), 0);

    /** Calcula el monto pendiente */
    const pendingAmount = transactions
        .filter((t) => t.status === "pending")
        .reduce((sum, t) => sum + (t.amount || 0), 0);

    /** Formatea fecha para mostrar */
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("es-VE", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Facturación y Pagos
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Gestiona tus métodos de pago e historial de transacciones
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Métodos de Pago */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <CreditCard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                Métodos de Pago
                            </h3>
                        </div>
                        <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar
                        </Button>
                    </div>

                    {paymentMethods.length === 0 ? (
                        <div className="text-center py-8 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <CreditCard className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                No tienes métodos de pago registrados
                            </p>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Agregar Método de Pago
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {paymentMethods.map((method) => (
                                <article
                                    key={method.id}
                                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 dark:bg-gray-800"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                                <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {method.card_brand} •••• {method.last_four}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    Vence {method.exp_month}/{method.exp_year}
                                                </p>
                                                {method.is_default && (
                                                    <Badge className="mt-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-0">
                                                        <Check className="h-3 w-3 mr-1" />
                                                        Predeterminada
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                                            aria-label="Editar método de pago"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}

                    {/* Botón para agregar nuevo método */}
                    <button className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                        <Plus className="h-6 w-6 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Agregar Método de Pago
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Tarjeta de crédito, débito o transferencia
                        </p>
                    </button>

                    {/* Información de seguridad */}
                    <aside className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                            Pagos Seguros
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                            Todos los pagos están encriptados y protegidos. No almacenamos información completa de tarjetas.
                        </p>
                    </aside>
                </div>

                {/* Historial de Transacciones */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <Receipt className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                            Historial de Transacciones
                        </h3>
                    </div>

                    {transactions.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg">
                            No hay transacciones registradas
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {transactions.map((transaction) => (
                                <article
                                    key={transaction.id}
                                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 dark:bg-gray-800"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {transaction.description}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {formatDate(transaction.created_at)}
                                            </p>
                                            {transaction.invoice_number && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Factura: {transaction.invoice_number}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                                ${(transaction.amount || 0).toFixed(2)}
                                            </p>
                                            {transaction.status === "paid" ? (
                                                <Badge className="mt-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-0">
                                                    <Check className="h-3 w-3 mr-1" />
                                                    Pagado
                                                </Badge>
                                            ) : transaction.status === "pending" ? (
                                                <Badge className="mt-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-0">
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    Pendiente
                                                </Badge>
                                            ) : (
                                                <Badge className="mt-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-0">
                                                    Fallido
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-3 flex gap-2">
                                        <Button size="sm" variant="outline" className="flex-1">
                                            <Download className="h-3 w-3 mr-2" />
                                            Descargar
                                        </Button>
                                        {transaction.status === "pending" && (
                                            <Button size="sm" className="flex-1">
                                                Pagar Ahora
                                            </Button>
                                        )}
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}

                    <Button variant="outline" className="w-full">
                        Ver Todas las Transacciones
                    </Button>

                    {/* Resumen del Mes */}
                    <aside className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Resumen del Mes
                        </h4>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Total Gastado:</span>
                                <span className="font-semibold text-gray-900 dark:text-gray-100">
                                    ${totalSpent.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Transacciones Completadas:</span>
                                <span className="font-semibold text-gray-900 dark:text-gray-100">
                                    {transactions.filter((t) => t.status === "paid").length}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Pendiente:</span>
                                <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                                    ${pendingAmount.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
