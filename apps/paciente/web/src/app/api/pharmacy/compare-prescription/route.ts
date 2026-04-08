import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/utils/rate-limit';

// -------------------------------------------------------------------
// Prescription Price Comparison — BFF API Route
// -------------------------------------------------------------------
// For each medication in a prescription, searches pharmacy_inventory
// for pharmacies that have it in stock. Returns results grouped by
// pharmacy with per-medication pricing in USD and Bs.
// Auth required — patient must own the prescription.
// -------------------------------------------------------------------

interface InventoryRow {
  id: string;
  pharmacy_id: string;
  medication_name: string;
  generic_name: string | null;
  price_bs: number;
  price_usd: number | null;
  stock_quantity: number;
  in_stock: boolean;
}

interface PharmacyRow {
  id: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  avatar_url: string | null;
  lat: number | null;
  lng: number | null;
}

interface MedicationRow {
  id: string;
  medication_name: string;
  generic_name: string | null;
  dosage: string | null;
  total_quantity: string | null;
}

interface PharmacyGroup {
  pharmacy: PharmacyRow;
  medications: {
    medication_name: string;
    generic_name: string | null;
    price_bs: number;
    price_usd: number | null;
    in_stock: boolean;
    quantity: number;
  }[];
  total_bs: number;
  total_usd: number;
  items_available: number;
  items_total: number;
  all_available: boolean;
}

export async function GET(request: NextRequest) {
  try {
    const limited = checkRateLimit(request, 'authenticated');
    if (limited) return limited;

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const prescriptionId = searchParams.get('prescription_id');

    if (!prescriptionId) {
      return NextResponse.json(
        { error: 'Se requiere prescription_id.' },
        { status: 400 },
      );
    }

    // Verify the prescription belongs to the patient
    const { data: prescription, error: prescriptionError } = await supabase
      .from('prescriptions')
      .select('id, status')
      .eq('id', prescriptionId)
      .eq('patient_id', user.id)
      .single();

    if (prescriptionError || !prescription) {
      return NextResponse.json(
        { error: 'Receta no encontrada.' },
        { status: 404 },
      );
    }

    // Get all medications in the prescription
    const { data: medications, error: medsError } = await supabase
      .from('prescription_medications')
      .select('id, medication_name, generic_name, dosage, total_quantity')
      .eq('prescription_id', prescriptionId);

    if (medsError) {
      console.error('[Compare Prescription] Medications error:', medsError);
      return NextResponse.json(
        { error: 'Error al obtener medicamentos de la receta.' },
        { status: 500 },
      );
    }

    if (!medications || medications.length === 0) {
      return NextResponse.json({ data: [] });
    }

    const typedMedications = medications as MedicationRow[];

    // Search pharmacy_inventory for each medication name
    const medicationNames = typedMedications.map((m) => m.medication_name);

    const { data: inventoryRows, error: inventoryError } = await supabase
      .from('pharmacy_inventory')
      .select('id, pharmacy_id, medication_name, generic_name, price_bs, price_usd, stock_quantity, in_stock')
      .in('medication_name', medicationNames);

    if (inventoryError) {
      console.error('[Compare Prescription] Inventory error:', inventoryError);
      return NextResponse.json(
        { error: 'Error al buscar inventario de farmacias.' },
        { status: 500 },
      );
    }

    if (!inventoryRows || inventoryRows.length === 0) {
      return NextResponse.json({ data: [] });
    }

    const typedInventory = inventoryRows as InventoryRow[];

    // Get unique pharmacy IDs
    const pharmacyIds = [...new Set(typedInventory.map((r) => r.pharmacy_id))];

    // Fetch pharmacy details
    const { data: pharmacies, error: pharmacyError } = await supabase
      .from('profiles')
      .select('id, full_name, phone, address, city, state, avatar_url')
      .in('id', pharmacyIds);

    if (pharmacyError) {
      console.error('[Compare Prescription] Pharmacy details error:', pharmacyError);
    }

    const pharmacyMap = new Map<string, PharmacyRow>();
    if (pharmacies) {
      for (const p of pharmacies as PharmacyRow[]) {
        pharmacyMap.set(p.id, p);
      }
    }

    // Also try to get lat/lng from pharmacy_details (domain-specific table)
    const { data: pharmacyDetails } = await supabase
      .from('pharmacy_details')
      .select('pharmacy_id, lat, lng')
      .in('pharmacy_id', pharmacyIds);

    const coordMap = new Map<string, { lat: number | null; lng: number | null }>();
    if (pharmacyDetails) {
      for (const pd of pharmacyDetails as { pharmacy_id: string; lat: number | null; lng: number | null }[]) {
        coordMap.set(pd.pharmacy_id, { lat: pd.lat, lng: pd.lng });
      }
    }

    // Group inventory by pharmacy
    const grouped = new Map<string, InventoryRow[]>();
    for (const row of typedInventory) {
      const existing = grouped.get(row.pharmacy_id) ?? [];
      existing.push(row);
      grouped.set(row.pharmacy_id, existing);
    }

    // Build response
    const results: PharmacyGroup[] = [];

    for (const [pharmacyId, items] of grouped) {
      const pharmacyProfile = pharmacyMap.get(pharmacyId);
      const coords = coordMap.get(pharmacyId);

      const pharmacy: PharmacyRow = {
        id: pharmacyId,
        full_name: pharmacyProfile?.full_name ?? null,
        phone: pharmacyProfile?.phone ?? null,
        address: pharmacyProfile?.address ?? null,
        city: pharmacyProfile?.city ?? null,
        state: pharmacyProfile?.state ?? null,
        avatar_url: pharmacyProfile?.avatar_url ?? null,
        lat: coords?.lat ?? null,
        lng: coords?.lng ?? null,
      };

      // Build per-medication list: include every prescription med
      // If pharmacy has it, show price. If not, mark as not in stock.
      const meds = typedMedications.map((prescriptionMed) => {
        const inventoryItem = items.find(
          (i) => i.medication_name === prescriptionMed.medication_name,
        );

        if (inventoryItem && inventoryItem.in_stock && inventoryItem.stock_quantity > 0) {
          return {
            medication_name: prescriptionMed.medication_name,
            generic_name: inventoryItem.generic_name ?? prescriptionMed.generic_name,
            price_bs: inventoryItem.price_bs,
            price_usd: inventoryItem.price_usd,
            in_stock: true,
            quantity: inventoryItem.stock_quantity,
          };
        }

        return {
          medication_name: prescriptionMed.medication_name,
          generic_name: prescriptionMed.generic_name,
          price_bs: 0,
          price_usd: null,
          in_stock: false,
          quantity: 0,
        };
      });

      const itemsAvailable = meds.filter((m) => m.in_stock).length;
      const totalBs = meds.reduce((sum, m) => sum + m.price_bs, 0);
      const totalUsd = meds.reduce((sum, m) => sum + (m.price_usd ?? 0), 0);

      results.push({
        pharmacy,
        medications: meds,
        total_bs: totalBs,
        total_usd: totalUsd,
        items_available: itemsAvailable,
        items_total: typedMedications.length,
        all_available: itemsAvailable === typedMedications.length,
      });
    }

    // Sort: all available first, then by total price ascending
    results.sort((a, b) => {
      if (a.all_available && !b.all_available) return -1;
      if (!a.all_available && b.all_available) return 1;
      return a.total_bs - b.total_bs;
    });

    return NextResponse.json({ data: results });
  } catch (error) {
    console.error('[Compare Prescription] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 },
    );
  }
}
