import { supabase } from '@/lib/supabase/client';

export type PaymentStatus = 'pending' | 'approved' | 'rejected';

export interface Payment {
    id: string;
    user_id: string;
    amount: number;
    currency: 'VES' | 'USD';
    exchange_rate?: number;
    reference_number: string;
    bank_origin: string;
    bank_destination?: string;
    payment_date: string;
    status: PaymentStatus;
    proof_url?: string;
    created_at: string;
    updated_at: string;
}

export type CreatePaymentInput = Omit<Payment, 'id' | 'user_id' | 'status' | 'created_at' | 'updated_at'>;

export class PaymentService {
    /**
     * Report a new payment (Manuel verification)
     */
    static async createPaymentReport(paymentData: CreatePaymentInput): Promise<Payment | null> {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                throw new Error('User must be authenticated to report a payment');
            }

            const { data, error } = await supabase
                .from('payments')
                .insert({
                    ...paymentData,
                    user_id: user.id,
                    status: 'pending'
                })
                .select()
                .single();

            if (error) {
                console.error('Error reporting payment:', error);
                throw error;
            }

            return data as Payment;
        } catch (error) {
            console.error('Failed to create payment report:', error);
            throw error;
        }
    }

    /**
     * Get all payments for the current user
     */
    static async getUserPayments(): Promise<Payment[]> {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                return [];
            }

            const { data, error } = await supabase
                .from('payments')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching user payments:', error);
                throw error;
            }

            return data as Payment[];
        } catch (error) {
            console.error('Failed to get user payments:', error);
            return [];
        }
    }

    /**
     * Update payment status (Admin only)
     */
    static async updatePaymentStatus(paymentId: string, status: PaymentStatus): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('payments')
                .update({ status, updated_at: new Date().toISOString() })
                .eq('id', paymentId);

            if (error) {
                console.error(`Error updating payment status ${paymentId}:`, error);
                throw error;
            }

            return true;
        } catch (error) {
            console.error('Failed to update payment status:', error);
            return false;
        }
    }
}
