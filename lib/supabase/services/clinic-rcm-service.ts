/**
 * Servicio para gestión del Revenue Cycle Management (RCM)
 * 
 * Maneja claims, pagos, conciliación y KPIs financieros
 */

import { createClient } from '@/lib/supabase/client';
import type {
  RCMClaim,
  RCMClaimItem,
  RCMPayment,
  PayerContract,
  ClaimSummary,
  ClaimFilters,
  CreateClaimInput,
  RegisterPaymentInput,
  ClinicFinancialKPIs,
} from '@/lib/types/clinic.types';

const supabase = createClient();

// ============ Contratos con Pagadores ============

export async function getPayerContracts(clinicId: string): Promise<PayerContract[]> {
  const { data, error } = await supabase
    .from('payer_contracts')
    .select('*')
    .eq('clinic_id', clinicId)
    .order('payer_name');

  if (error) throw error;
  return data || [];
}

export async function getActivePayerContracts(clinicId: string): Promise<PayerContract[]> {
  const { data, error } = await supabase
    .from('payer_contracts')
    .select('*')
    .eq('clinic_id', clinicId)
    .eq('status', 'active')
    .order('payer_name');

  if (error) throw error;
  return data || [];
}

export async function createPayerContract(
  contract: Omit<PayerContract, 'id' | 'created_at' | 'updated_at'>
): Promise<PayerContract> {
  const { data, error } = await supabase
    .from('payer_contracts')
    .insert(contract)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePayerContract(
  contractId: string,
  updates: Partial<PayerContract>
): Promise<PayerContract> {
  const { data, error } = await supabase
    .from('payer_contracts')
    .update(updates)
    .eq('id', contractId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============ Claims ============

export async function getClaims(filters: ClaimFilters): Promise<ClaimSummary[]> {
  let query = supabase
    .from('rcm_claims')
    .select(`
      *,
      payer_contracts:payer_contract_id (payer_name),
      patients:patient_id (
        email,
        raw_user_meta_data
      )
    `);

  if (filters.clinic_ids && filters.clinic_ids.length > 0) {
    query = query.in('clinic_id', filters.clinic_ids);
  }

  if (filters.location_ids && filters.location_ids.length > 0) {
    query = query.in('location_id', filters.location_ids);
  }

  if (filters.claim_status && filters.claim_status.length > 0) {
    query = query.in('status', filters.claim_status);
  }

  if (filters.claim_type && filters.claim_type.length > 0) {
    query = query.in('claim_type', filters.claim_type);
  }

  if (filters.patient_id) {
    query = query.eq('patient_id', filters.patient_id);
  }

  if (filters.date_from) {
    query = query.gte('claim_date', filters.date_from);
  }

  if (filters.date_to) {
    query = query.lte('claim_date', filters.date_to);
  }

  if (filters.min_amount !== undefined) {
    query = query.gte('total_amount', filters.min_amount);
  }

  if (filters.max_amount !== undefined) {
    query = query.lte('total_amount', filters.max_amount);
  }

  query = query.order('claim_date', { ascending: false });

  const { data, error } = await query;

  if (error) throw error;

  // Mapear a ClaimSummary
  return (data || []).map((claim: any) => ({
    ...claim,
    payer_name: claim.payer_contracts?.payer_name,
    patient_name: claim.patients?.raw_user_meta_data?.full_name || claim.patients?.email,
  }));
}

export async function getClaimById(claimId: string): Promise<RCMClaim | null> {
  const { data, error } = await supabase
    .from('rcm_claims')
    .select('*')
    .eq('id', claimId)
    .single();

  if (error) throw error;
  return data;
}

export async function createClaim(input: CreateClaimInput): Promise<RCMClaim> {
  // Generar número de claim único
  const claimNumber = `CLM-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  const { data: claim, error: claimError } = await supabase
    .from('rcm_claims')
    .insert({
      clinic_id: input.clinic_id,
      location_id: input.location_id,
      claim_number: claimNumber,
      patient_id: input.patient_id,
      payer_contract_id: input.payer_contract_id,
      service_date: input.service_date,
      claim_date: new Date().toISOString().split('T')[0],
      claim_type: input.claim_type,
      status: 'draft',
      total_amount: 0, // Se calculará con items
      paid_amount: 0,
      notes: input.notes,
    })
    .select()
    .single();

  if (claimError) throw claimError;

  // Insertar items
  if (input.items && input.items.length > 0) {
    const items = input.items.map((item, index) => ({
      claim_id: claim.id,
      line_number: index + 1,
      service_code: item.service_code,
      service_description: item.service_description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.quantity * item.unit_price,
      provider_id: item.provider_id,
    }));

    const { error: itemsError } = await supabase
      .from('rcm_claim_items')
      .insert(items);

    if (itemsError) throw itemsError;
  }

  // Refrescar claim con total actualizado
  return (await getClaimById(claim.id))!;
}

export async function updateClaim(
  claimId: string,
  updates: Partial<RCMClaim>
): Promise<RCMClaim> {
  const { data, error } = await supabase
    .from('rcm_claims')
    .update(updates)
    .eq('id', claimId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function submitClaim(claimId: string): Promise<RCMClaim> {
  return updateClaim(claimId, {
    status: 'submitted',
    submitted_at: new Date().toISOString(),
  });
}

export async function approveClaim(
  claimId: string,
  approvedAmount: number
): Promise<RCMClaim> {
  return updateClaim(claimId, {
    status: 'approved',
    approved_amount: approvedAmount,
    approved_at: new Date().toISOString(),
  });
}

export async function denyClaim(
  claimId: string,
  denialReason: string,
  denialCode?: string
): Promise<RCMClaim> {
  return updateClaim(claimId, {
    status: 'denied',
    denial_reason: denialReason,
    denial_code: denialCode,
  });
}

// ============ Claim Items ============

export async function getClaimItems(claimId: string): Promise<RCMClaimItem[]> {
  const { data, error } = await supabase
    .from('rcm_claim_items')
    .select(`
      *,
      provider:provider_id (email, raw_user_meta_data)
    `)
    .eq('claim_id', claimId)
    .order('line_number');

  if (error) throw error;
  return data || [];
}

export async function addClaimItem(
  claimId: string,
  item: Omit<RCMClaimItem, 'id' | 'claim_id' | 'line_number' | 'created_at' | 'updated_at'>
): Promise<RCMClaimItem> {
  // Obtener el siguiente line_number
  const { data: items } = await supabase
    .from('rcm_claim_items')
    .select('line_number')
    .eq('claim_id', claimId)
    .order('line_number', { ascending: false })
    .limit(1);

  const nextLineNumber = items && items.length > 0 ? items[0].line_number + 1 : 1;

  const { data, error } = await supabase
    .from('rcm_claim_items')
    .insert({
      ...item,
      claim_id: claimId,
      line_number: nextLineNumber,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteClaimItem(itemId: string): Promise<void> {
  const { error } = await supabase
    .from('rcm_claim_items')
    .delete()
    .eq('id', itemId);

  if (error) throw error;
}

// ============ Payments ============

export async function getClaimPayments(claimId: string): Promise<RCMPayment[]> {
  const { data, error } = await supabase
    .from('rcm_payments')
    .select('*')
    .eq('claim_id', claimId)
    .order('payment_date', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function registerPayment(input: RegisterPaymentInput): Promise<RCMPayment> {
  const paymentNumber = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  const { data, error } = await supabase
    .from('rcm_payments')
    .insert({
      ...input,
      payment_number: paymentNumber,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function reconcilePayment(
  paymentId: string,
  userId: string
): Promise<RCMPayment> {
  const { data, error } = await supabase
    .from('rcm_payments')
    .update({
      reconciled: true,
      reconciled_at: new Date().toISOString(),
      reconciled_by: userId,
    })
    .eq('id', paymentId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUnreconciledPayments(clinicId: string): Promise<RCMPayment[]> {
  const { data, error } = await supabase
    .from('rcm_payments')
    .select(`
      *,
      claim:claim_id (clinic_id, claim_number, patient_id)
    `)
    .eq('reconciled', false)
    .order('payment_date', { ascending: false });

  if (error) throw error;

  // Filtrar por clinic_id a través de claim
  return (data || []).filter((payment: any) => payment.claim?.clinic_id === clinicId);
}

// ============ KPIs Financieros ============

export async function getFinancialKPIs(
  clinicId: string,
  monthsBack: number = 6
): Promise<ClinicFinancialKPIs[]> {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - monthsBack);

  const { data, error } = await supabase
    .from('clinic_financial_kpis')
    .select('*')
    .eq('clinic_id', clinicId)
    .gte('month', startDate.toISOString().split('T')[0])
    .order('month', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function refreshFinancialKPIs(clinicId: string): Promise<void> {
  // Refrescar vista materializada
  const { error } = await supabase.rpc('refresh_financial_kpis', {
    p_clinic_id: clinicId,
  });

  if (error) throw error;
}

/**
 * Calcula DSO (Days Sales Outstanding) - días promedio de cobro
 */
export async function calculateDSO(
  clinicId: string,
  days: number = 90
): Promise<number> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('rcm_claims')
    .select('claim_date, paid_at')
    .eq('clinic_id', clinicId)
    .eq('status', 'paid')
    .gte('claim_date', startDate.toISOString().split('T')[0]);

  if (error || !data || data.length === 0) return 0;

  const totalDays = data.reduce((sum, claim) => {
    const claimDate = new Date(claim.claim_date);
    const paidDate = new Date(claim.paid_at!);
    const daysDiff = Math.floor((paidDate.getTime() - claimDate.getTime()) / (1000 * 60 * 60 * 24));
    return sum + daysDiff;
  }, 0);

  return Math.round(totalDays / data.length);
}

/**
 * Obtiene claims próximos a vencer (aging)
 */
export async function getAgingClaims(
  clinicId: string,
  daysThreshold: number = 30
): Promise<ClaimSummary[]> {
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() - daysThreshold);

  const filters: ClaimFilters = {
    clinic_ids: [clinicId],
    claim_status: ['submitted', 'in_review', 'approved'],
    date_to: thresholdDate.toISOString().split('T')[0],
  };

  return getClaims(filters);
}
