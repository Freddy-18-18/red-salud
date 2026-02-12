import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  Plus,
  Edit2,
  Check,
  Clock,
  Download,
} from "lucide-react";
import { Button } from "@red-salud/ui";
import { getPaymentMethods, getTransactions } from "@/lib/supabase/services/billing-service";

interface PaymentMethod {
  id: string;
  user_id: string;
  card_brand: string;
  last_four: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
  type?: string;
  expires_at?: string;
}

interface Transaction {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  status: "paid" | "pending" | "failed";
  invoice_number?: string;
  created_at: string;
}

interface BillingTabProps {
  userId?: string;
}

export function BillingTab({ userId }: BillingTabProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      const [methodsResult, transactionsResult] = await Promise.all([
        getPaymentMethods(userId),
        getTransactions(userId, 10),
      ]);

      if (isMounted) {
        if (methodsResult.success) {
          setPaymentMethods(methodsResult.data || []);
        }
        if (transactionsResult.success) {
          setTransactions(transactionsResult.data || []);
        }
        setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const totalSpent = transactions
    .filter((t) => t.status === "paid")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const pendingAmount = transactions
    .filter((t) => t.status === "pending")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  return (
    <motion.article
      key="billing"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      <header className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Facturación y Pagos
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Gestiona tus métodos de pago e historial de transacciones
        </p>
      </header>

      <div className="grid grid-cols-2 gap-6">
        {/* Métodos de Pago */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Métodos de Pago
            </h3>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Agregar
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Cargando...
            </div>
          ) : paymentMethods.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No tienes métodos de pago registrados
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Método de Pago
              </Button>
            </div>
          ) : (
            paymentMethods.map((method) => (
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
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full mt-2">
                          <Check className="h-3 w-3" />
                          Predeterminada
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    aria-label="Editar método de pago"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                </div>
              </article>
            ))
          )}

          <button className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
            <Plus className="h-6 w-6 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Agregar Método de Pago
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Tarjeta de crédito, débito o transferencia
            </p>
          </button>

          <aside className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
              Pagos Seguros
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Todos los pagos están encriptados y protegidos. No almacenamos
              información completa de tarjetas.
            </p>
          </aside>
        </section>

        {/* Historial de Transacciones */}
        <section className="space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            Historial de Transacciones
          </h3>

          {loading ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Cargando...
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
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
                        {transaction.created_at
                          ? new Date(transaction.created_at).toLocaleDateString("es-VE", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                          : "Fecha desconocida"}
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
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full mt-1">
                          <Check className="h-3 w-3" />
                          Pagado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-0.5 rounded-full mt-1">
                          <Clock className="h-3 w-3" />
                          Pendiente
                        </span>
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

          <aside className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mt-4">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
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
                <span className="text-gray-600 dark:text-gray-400">Consultas:</span>
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
        </section>
      </div>
    </motion.article>
  );
}
