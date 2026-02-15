import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Payment {
    id: string;
    amount: number;
    currency: string;
    reference_number: string;
    bank_origin: string;
    payment_date: string;
    status: 'pending' | 'approved' | 'rejected';
    user_email: string;
    user_full_name: string;
}

const PaymentsPage: React.FC = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.rpc('get_admin_payments', {
                status_filter: filter === 'all' ? null : filter
            });

            if (error) throw error;
            setPayments(data || []);
        } catch (error) {
            console.error('Error fetching payments:', error);
            toast.error('Error al cargar pagos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, [filter]);

    const handleStatusUpdate = async (id: string, newStatus: 'approved' | 'rejected') => {
        try {
            const { error } = await supabase.rpc('admin_update_payment_status', {
                payment_id: id,
                new_status: newStatus
            });

            if (error) throw error;

            toast.success(`Pago ${newStatus === 'approved' ? 'aprobado' : 'rechazado'} exitosamente`);
            fetchPayments();
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Error al actualizar estado');
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Gestión de Pagos</h1>
                    <p className="text-gray-500">Valida y gestiona los reportes de pago móvil</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('pending')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        Pendientes
                    </button>
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        Todos
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3">Fecha</th>
                                <th className="px-6 py-3">Usuario</th>
                                <th className="px-6 py-3">Referencia</th>
                                <th className="px-6 py-3">Banco</th>
                                <th className="px-6 py-3">Monto</th>
                                <th className="px-6 py-3">Estado</th>
                                <th className="px-6 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                        Cargando pagos...
                                    </td>
                                </tr>
                            ) : payments.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                        No hay pagos encontrados con este filtro.
                                    </td>
                                </tr>
                            ) : (
                                payments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {format(new Date(payment.payment_date), "dd MMM yyyy", { locale: es })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{payment.user_full_name || 'Sin nombre'}</div>
                                            <div className="text-gray-500 text-xs">{payment.user_email}</div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-gray-600">
                                            {payment.reference_number}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {payment.bank_origin}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {payment.currency === 'VES' ? 'Bs' : '$'} {Number(payment.amount).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                                ${payment.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                    payment.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'}`}>
                                                {payment.status === 'approved' ? 'Aprobado' :
                                                    payment.status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {payment.status === 'pending' && (
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleStatusUpdate(payment.id, 'approved')}
                                                        className="text-green-600 hover:text-green-900 hover:bg-green-50 p-1 rounded transition-colors"
                                                        title="Aprobar"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(payment.id, 'rejected')}
                                                        className="text-red-600 hover:text-red-900 hover:bg-red-50 p-1 rounded transition-colors"
                                                        title="Rechazar"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PaymentsPage;
