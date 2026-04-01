-- ============================================================================
-- PHARMACY COMPLETE SCHEMA MIGRATION
-- Red Salud — Pharmacy Management MVP (Venezuelan Market)
-- ============================================================================
-- This migration creates all pharmacy domain tables, enums, indexes,
-- RLS policies, triggers, functions, and dashboard views.
--
-- EXISTING TABLES (not touched):
--   pharmacy_details, pharmacy_inventory, pharmacy_orders,
--   prescriptions, prescription_medications, medications_catalog,
--   exchange_rates, profiles, audit_logs
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. ENUM TYPES
-- ============================================================================

CREATE TYPE pharmacy_product_category AS ENUM (
  'medicamentos',
  'otc',
  'cuidado_personal',
  'suplementos',
  'equipos_medicos',
  'bebes',
  'otros'
);

CREATE TYPE pharmacy_batch_status AS ENUM (
  'active',
  'expired',
  'recalled',
  'depleted'
);

CREATE TYPE pharmacy_po_status AS ENUM (
  'draft',
  'sent',
  'confirmed',
  'partial',
  'received',
  'cancelled'
);

CREATE TYPE pharmacy_payment_status AS ENUM (
  'pending',
  'partial',
  'paid'
);

CREATE TYPE pharmacy_invoice_payment_method AS ENUM (
  'cash_bs',
  'cash_usd',
  'zelle',
  'pago_movil',
  'punto_venta',
  'transferencia',
  'mixed'
);

CREATE TYPE pharmacy_invoice_status AS ENUM (
  'completed',
  'voided',
  'pending'
);

CREATE TYPE pharmacy_cash_session_status AS ENUM (
  'open',
  'closed',
  'reconciled'
);

CREATE TYPE pharmacy_staff_role AS ENUM (
  'owner',
  'manager',
  'pharmacist',
  'assistant',
  'cashier',
  'delivery'
);

CREATE TYPE pharmacy_alert_type AS ENUM (
  'low_stock',
  'expiry_warning',
  'expiry_critical',
  'out_of_stock',
  'order_received',
  'price_change',
  'controlled_med'
);

CREATE TYPE pharmacy_alert_severity AS ENUM (
  'info',
  'warning',
  'critical'
);

CREATE TYPE pharmacy_delivery_status AS ENUM (
  'pending',
  'assigned',
  'in_transit',
  'delivered',
  'failed',
  'returned'
);

CREATE TYPE pharmacy_loyalty_tier AS ENUM (
  'bronce',
  'plata',
  'oro',
  'platino'
);

CREATE TYPE pharmacy_loyalty_tx_type AS ENUM (
  'earn',
  'redeem',
  'adjust',
  'expire'
);

CREATE TYPE pharmacy_currency_display AS ENUM (
  'usd',
  'bs',
  'both'
);

-- ============================================================================
-- 2. TABLES
-- ============================================================================

-- --------------------------------------------------------------------------
-- 2.1  pharmacy_suppliers (created before products/batches that reference it)
-- --------------------------------------------------------------------------
CREATE TABLE pharmacy_suppliers (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id     uuid NOT NULL REFERENCES pharmacy_details(id) ON DELETE CASCADE,
  company_name    text NOT NULL,
  rif             text,
  contact_name    text,
  phone           text,
  email           text,
  address         text,
  city            text,
  state           text,
  payment_terms   text,
  credit_limit_usd numeric(12,2),
  credit_days     integer,
  delivery_days   integer,
  categories      text[] DEFAULT '{}',
  rating          numeric(2,1) CHECK (rating >= 1 AND rating <= 5),
  is_active       boolean NOT NULL DEFAULT true,
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- --------------------------------------------------------------------------
-- 2.2  pharmacy_products
-- --------------------------------------------------------------------------
CREATE TABLE pharmacy_products (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id           uuid NOT NULL REFERENCES pharmacy_details(id) ON DELETE CASCADE,
  medication_catalog_id uuid REFERENCES medications_catalog(id) ON DELETE SET NULL,
  barcode               text,
  internal_code         text,
  name                  text NOT NULL,
  generic_name          text,
  presentation          text,
  concentration         text,
  pharmaceutical_form   text,
  manufacturer          text,
  category              pharmacy_product_category NOT NULL DEFAULT 'otros',
  subcategory           text,
  price_usd             numeric(12,2) NOT NULL DEFAULT 0,
  price_bs              numeric(12,2) NOT NULL DEFAULT 0,
  cost_usd              numeric(12,2) NOT NULL DEFAULT 0,
  cost_bs               numeric(12,2) NOT NULL DEFAULT 0,
  profit_margin         numeric(5,2),
  tax_rate              numeric(5,2) NOT NULL DEFAULT 16.00,  -- IVA Venezuela
  min_stock             integer NOT NULL DEFAULT 0,
  max_stock             integer,
  reorder_point         integer NOT NULL DEFAULT 5,
  requires_prescription boolean NOT NULL DEFAULT false,
  is_controlled         boolean NOT NULL DEFAULT false,
  controlled_type       text,
  is_refrigerated       boolean NOT NULL DEFAULT false,
  storage_conditions    text,
  image_url             text,
  is_active             boolean NOT NULL DEFAULT true,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT pharmacy_products_positive_prices CHECK (price_usd >= 0 AND price_bs >= 0),
  CONSTRAINT pharmacy_products_positive_costs  CHECK (cost_usd >= 0 AND cost_bs >= 0),
  CONSTRAINT pharmacy_products_stock_order     CHECK (max_stock IS NULL OR max_stock >= min_stock)
);

-- --------------------------------------------------------------------------
-- 2.3  pharmacy_batches
-- --------------------------------------------------------------------------
CREATE TABLE pharmacy_batches (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id        uuid NOT NULL REFERENCES pharmacy_products(id) ON DELETE CASCADE,
  pharmacy_id       uuid NOT NULL REFERENCES pharmacy_details(id) ON DELETE CASCADE,
  batch_number      text NOT NULL,
  expiry_date       date NOT NULL,
  manufacture_date  date,
  quantity_received integer NOT NULL DEFAULT 0 CHECK (quantity_received >= 0),
  quantity_available integer NOT NULL DEFAULT 0 CHECK (quantity_available >= 0),
  quantity_sold     integer NOT NULL DEFAULT 0 CHECK (quantity_sold >= 0),
  quantity_damaged  integer NOT NULL DEFAULT 0 CHECK (quantity_damaged >= 0),
  quantity_returned integer NOT NULL DEFAULT 0 CHECK (quantity_returned >= 0),
  supplier_id       uuid REFERENCES pharmacy_suppliers(id) ON DELETE SET NULL,
  purchase_price_usd numeric(12,2),
  purchase_price_bs  numeric(12,2),
  received_at       timestamptz NOT NULL DEFAULT now(),
  status            pharmacy_batch_status NOT NULL DEFAULT 'active',
  notes             text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT pharmacy_batches_expiry_after_manufacture
    CHECK (manufacture_date IS NULL OR expiry_date > manufacture_date),
  CONSTRAINT pharmacy_batches_qty_consistency
    CHECK (quantity_available <= quantity_received)
);

-- --------------------------------------------------------------------------
-- 2.4  pharmacy_purchase_orders
-- --------------------------------------------------------------------------
CREATE TABLE pharmacy_purchase_orders (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id             uuid NOT NULL REFERENCES pharmacy_details(id) ON DELETE CASCADE,
  supplier_id             uuid NOT NULL REFERENCES pharmacy_suppliers(id) ON DELETE RESTRICT,
  order_number            text NOT NULL,
  status                  pharmacy_po_status NOT NULL DEFAULT 'draft',
  subtotal_usd            numeric(12,2) NOT NULL DEFAULT 0,
  tax_usd                 numeric(12,2) NOT NULL DEFAULT 0,
  total_usd               numeric(12,2) NOT NULL DEFAULT 0,
  exchange_rate_used      numeric(12,4),
  total_bs                numeric(12,2) NOT NULL DEFAULT 0,
  payment_method          text,
  payment_status          pharmacy_payment_status NOT NULL DEFAULT 'pending',
  expected_delivery_date  date,
  received_at             timestamptz,
  notes                   text,
  created_by              uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT pharmacy_po_order_number_unique UNIQUE (pharmacy_id, order_number)
);

-- --------------------------------------------------------------------------
-- 2.5  pharmacy_purchase_order_items
-- --------------------------------------------------------------------------
CREATE TABLE pharmacy_purchase_order_items (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id uuid NOT NULL REFERENCES pharmacy_purchase_orders(id) ON DELETE CASCADE,
  product_id        uuid NOT NULL REFERENCES pharmacy_products(id) ON DELETE RESTRICT,
  quantity_ordered  integer NOT NULL CHECK (quantity_ordered > 0),
  quantity_received integer NOT NULL DEFAULT 0 CHECK (quantity_received >= 0),
  unit_cost_usd     numeric(12,2) NOT NULL DEFAULT 0,
  unit_cost_bs      numeric(12,2) NOT NULL DEFAULT 0,
  subtotal_usd      numeric(12,2) NOT NULL DEFAULT 0,
  batch_number      text,
  expiry_date       date
);

-- --------------------------------------------------------------------------
-- 2.6  pharmacy_invoices
-- --------------------------------------------------------------------------
CREATE TABLE pharmacy_invoices (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id           uuid NOT NULL REFERENCES pharmacy_details(id) ON DELETE CASCADE,
  invoice_number        text NOT NULL,
  customer_name         text,
  customer_ci           text,      -- cedula de identidad
  customer_rif          text,
  customer_phone        text,
  prescription_id       uuid REFERENCES prescriptions(id) ON DELETE SET NULL,
  subtotal_usd          numeric(12,2) NOT NULL DEFAULT 0,
  discount_usd          numeric(12,2) NOT NULL DEFAULT 0,
  tax_usd               numeric(12,2) NOT NULL DEFAULT 0,
  total_usd             numeric(12,2) NOT NULL DEFAULT 0,
  exchange_rate_used    numeric(12,4),
  total_bs              numeric(12,2) NOT NULL DEFAULT 0,
  payment_method        pharmacy_invoice_payment_method NOT NULL DEFAULT 'cash_bs',
  payment_reference     text,
  payment_details       jsonb DEFAULT '{}',  -- for mixed payments
  status                pharmacy_invoice_status NOT NULL DEFAULT 'pending',
  cashier_id            uuid REFERENCES profiles(id) ON DELETE SET NULL,
  notes                 text,
  is_fiscal             boolean NOT NULL DEFAULT false,
  fiscal_printer_number text,
  created_at            timestamptz NOT NULL DEFAULT now(),
  voided_at             timestamptz,
  voided_by             uuid REFERENCES profiles(id) ON DELETE SET NULL,
  void_reason           text,

  CONSTRAINT pharmacy_invoice_number_unique UNIQUE (pharmacy_id, invoice_number),
  CONSTRAINT pharmacy_invoices_positive_amounts CHECK (
    subtotal_usd >= 0 AND discount_usd >= 0 AND tax_usd >= 0 AND total_usd >= 0 AND total_bs >= 0
  )
);

-- --------------------------------------------------------------------------
-- 2.7  pharmacy_invoice_items
-- --------------------------------------------------------------------------
CREATE TABLE pharmacy_invoice_items (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id          uuid NOT NULL REFERENCES pharmacy_invoices(id) ON DELETE CASCADE,
  product_id          uuid NOT NULL REFERENCES pharmacy_products(id) ON DELETE RESTRICT,
  batch_id            uuid REFERENCES pharmacy_batches(id) ON DELETE SET NULL,
  quantity            integer NOT NULL CHECK (quantity > 0),
  unit_price_usd      numeric(12,2) NOT NULL DEFAULT 0,
  unit_price_bs       numeric(12,2) NOT NULL DEFAULT 0,
  discount_percent    numeric(5,2) NOT NULL DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100),
  subtotal_usd        numeric(12,2) NOT NULL DEFAULT 0,
  subtotal_bs         numeric(12,2) NOT NULL DEFAULT 0,
  is_prescription_item boolean NOT NULL DEFAULT false
);

-- --------------------------------------------------------------------------
-- 2.8  pharmacy_cash_sessions
-- --------------------------------------------------------------------------
CREATE TABLE pharmacy_cash_sessions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id         uuid NOT NULL REFERENCES pharmacy_details(id) ON DELETE CASCADE,
  cashier_id          uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  opened_at           timestamptz NOT NULL DEFAULT now(),
  closed_at           timestamptz,
  opening_balance_bs  numeric(12,2) NOT NULL DEFAULT 0,
  opening_balance_usd numeric(12,2) NOT NULL DEFAULT 0,
  closing_balance_bs  numeric(12,2),
  closing_balance_usd numeric(12,2),
  expected_bs         numeric(12,2),
  expected_usd        numeric(12,2),
  difference_bs       numeric(12,2),
  difference_usd      numeric(12,2),
  total_sales_count   integer NOT NULL DEFAULT 0,
  total_sales_bs      numeric(12,2) NOT NULL DEFAULT 0,
  total_sales_usd     numeric(12,2) NOT NULL DEFAULT 0,
  status              pharmacy_cash_session_status NOT NULL DEFAULT 'open',
  notes               text
);

-- --------------------------------------------------------------------------
-- 2.9  pharmacy_staff
-- --------------------------------------------------------------------------
CREATE TABLE pharmacy_staff (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id     uuid NOT NULL REFERENCES pharmacy_details(id) ON DELETE CASCADE,
  profile_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role            pharmacy_staff_role NOT NULL DEFAULT 'assistant',
  schedule        jsonb DEFAULT '{}',
  hourly_rate_usd numeric(8,2),
  is_active       boolean NOT NULL DEFAULT true,
  hired_at        date,
  terminated_at   date,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT pharmacy_staff_unique_member UNIQUE (pharmacy_id, profile_id),
  CONSTRAINT pharmacy_staff_terminated_after_hired
    CHECK (terminated_at IS NULL OR hired_at IS NULL OR terminated_at >= hired_at)
);

-- --------------------------------------------------------------------------
-- 2.10  pharmacy_alerts
-- --------------------------------------------------------------------------
CREATE TABLE pharmacy_alerts (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id         uuid NOT NULL REFERENCES pharmacy_details(id) ON DELETE CASCADE,
  alert_type          pharmacy_alert_type NOT NULL,
  severity            pharmacy_alert_severity NOT NULL DEFAULT 'info',
  title               text NOT NULL,
  message             text,
  related_product_id  uuid REFERENCES pharmacy_products(id) ON DELETE SET NULL,
  related_batch_id    uuid REFERENCES pharmacy_batches(id) ON DELETE SET NULL,
  is_read             boolean NOT NULL DEFAULT false,
  is_resolved         boolean NOT NULL DEFAULT false,
  resolved_by         uuid REFERENCES profiles(id) ON DELETE SET NULL,
  resolved_at         timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now()
);

-- --------------------------------------------------------------------------
-- 2.11  pharmacy_delivery_zones
-- --------------------------------------------------------------------------
CREATE TABLE pharmacy_delivery_zones (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id             uuid NOT NULL REFERENCES pharmacy_details(id) ON DELETE CASCADE,
  zone_name               text NOT NULL,
  municipalities          text[] DEFAULT '{}',
  delivery_fee_usd        numeric(12,2) NOT NULL DEFAULT 0,
  delivery_fee_bs         numeric(12,2) NOT NULL DEFAULT 0,
  estimated_time_minutes  integer,
  is_active               boolean NOT NULL DEFAULT true,
  created_at              timestamptz NOT NULL DEFAULT now()
);

-- --------------------------------------------------------------------------
-- 2.12  pharmacy_deliveries
-- --------------------------------------------------------------------------
CREATE TABLE pharmacy_deliveries (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id         uuid NOT NULL REFERENCES pharmacy_details(id) ON DELETE CASCADE,
  invoice_id          uuid REFERENCES pharmacy_invoices(id) ON DELETE SET NULL,
  order_id            uuid REFERENCES pharmacy_orders(id) ON DELETE SET NULL,
  delivery_person_id  uuid REFERENCES profiles(id) ON DELETE SET NULL,
  customer_name       text,
  customer_phone      text,
  delivery_address    text,
  zone_id             uuid REFERENCES pharmacy_delivery_zones(id) ON DELETE SET NULL,
  status              pharmacy_delivery_status NOT NULL DEFAULT 'pending',
  estimated_delivery_at timestamptz,
  delivered_at        timestamptz,
  delivery_notes      text,
  customer_signature_url text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- --------------------------------------------------------------------------
-- 2.13  pharmacy_loyalty_programs
-- --------------------------------------------------------------------------
CREATE TABLE pharmacy_loyalty_programs (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id           uuid NOT NULL REFERENCES pharmacy_details(id) ON DELETE CASCADE,
  program_name          text NOT NULL DEFAULT 'Programa de Fidelidad',
  points_per_usd        numeric(8,2) NOT NULL DEFAULT 1.00,
  points_per_bs         numeric(8,2) NOT NULL DEFAULT 0.01,
  min_redemption_points integer NOT NULL DEFAULT 100,
  redemption_value_usd  numeric(8,4) NOT NULL DEFAULT 0.01,
  is_active             boolean NOT NULL DEFAULT true,
  created_at            timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT pharmacy_loyalty_one_per_pharmacy UNIQUE (pharmacy_id)
);

-- --------------------------------------------------------------------------
-- 2.14  pharmacy_loyalty_members
-- --------------------------------------------------------------------------
CREATE TABLE pharmacy_loyalty_members (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id           uuid NOT NULL REFERENCES pharmacy_details(id) ON DELETE CASCADE,
  customer_name         text NOT NULL,
  customer_ci           text,
  customer_phone        text,
  customer_email        text,
  points_balance        integer NOT NULL DEFAULT 0 CHECK (points_balance >= 0),
  total_points_earned   integer NOT NULL DEFAULT 0 CHECK (total_points_earned >= 0),
  total_points_redeemed integer NOT NULL DEFAULT 0 CHECK (total_points_redeemed >= 0),
  tier                  pharmacy_loyalty_tier NOT NULL DEFAULT 'bronce',
  joined_at             timestamptz NOT NULL DEFAULT now(),
  last_purchase_at      timestamptz,

  CONSTRAINT pharmacy_loyalty_member_unique UNIQUE (pharmacy_id, customer_ci)
);

-- --------------------------------------------------------------------------
-- 2.15  pharmacy_loyalty_transactions
-- --------------------------------------------------------------------------
CREATE TABLE pharmacy_loyalty_transactions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id         uuid NOT NULL REFERENCES pharmacy_loyalty_members(id) ON DELETE CASCADE,
  pharmacy_id       uuid NOT NULL REFERENCES pharmacy_details(id) ON DELETE CASCADE,
  invoice_id        uuid REFERENCES pharmacy_invoices(id) ON DELETE SET NULL,
  transaction_type  pharmacy_loyalty_tx_type NOT NULL,
  points            integer NOT NULL,
  description       text,
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- --------------------------------------------------------------------------
-- 2.16  pharmacy_settings
-- --------------------------------------------------------------------------
CREATE TABLE pharmacy_settings (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id                 uuid NOT NULL REFERENCES pharmacy_details(id) ON DELETE CASCADE,
  default_tax_rate            numeric(5,2) NOT NULL DEFAULT 16.00,
  currency_display            pharmacy_currency_display NOT NULL DEFAULT 'both',
  auto_update_exchange_rate   boolean NOT NULL DEFAULT true,
  low_stock_threshold         integer NOT NULL DEFAULT 10,
  expiry_warning_days         integer NOT NULL DEFAULT 90,
  fiscal_printer_enabled      boolean NOT NULL DEFAULT false,
  fiscal_printer_model        text,
  receipt_header              text,
  receipt_footer              text,
  delivery_enabled            boolean NOT NULL DEFAULT false,
  loyalty_enabled             boolean NOT NULL DEFAULT false,
  sms_notifications_enabled   boolean NOT NULL DEFAULT false,
  email_notifications_enabled boolean NOT NULL DEFAULT true,
  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT pharmacy_settings_one_per_pharmacy UNIQUE (pharmacy_id)
);

-- --------------------------------------------------------------------------
-- 2.17  pharmacy_insurance_contracts
-- --------------------------------------------------------------------------
CREATE TABLE pharmacy_insurance_contracts (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id         uuid NOT NULL REFERENCES pharmacy_details(id) ON DELETE CASCADE,
  insurance_company   text NOT NULL,
  contract_number     text,
  discount_percent    numeric(5,2) NOT NULL DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100),
  copay_percent       numeric(5,2) NOT NULL DEFAULT 0 CHECK (copay_percent >= 0 AND copay_percent <= 100),
  coverage_types      text[] DEFAULT '{}',
  is_active           boolean NOT NULL DEFAULT true,
  valid_from          date,
  valid_until         date,
  created_at          timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT pharmacy_insurance_valid_range
    CHECK (valid_until IS NULL OR valid_from IS NULL OR valid_until >= valid_from)
);


-- ============================================================================
-- 3. INDEXES
-- ============================================================================

-- pharmacy_products
CREATE INDEX idx_pharmacy_products_pharmacy     ON pharmacy_products (pharmacy_id);
CREATE INDEX idx_pharmacy_products_catalog      ON pharmacy_products (medication_catalog_id) WHERE medication_catalog_id IS NOT NULL;
CREATE INDEX idx_pharmacy_products_barcode      ON pharmacy_products (barcode) WHERE barcode IS NOT NULL;
CREATE INDEX idx_pharmacy_products_category     ON pharmacy_products (pharmacy_id, category);
CREATE INDEX idx_pharmacy_products_active       ON pharmacy_products (pharmacy_id, is_active) WHERE is_active = true;
CREATE INDEX idx_pharmacy_products_name_search  ON pharmacy_products USING gin (to_tsvector('spanish', name));

-- pharmacy_batches
CREATE INDEX idx_pharmacy_batches_product       ON pharmacy_batches (product_id);
CREATE INDEX idx_pharmacy_batches_pharmacy      ON pharmacy_batches (pharmacy_id);
CREATE INDEX idx_pharmacy_batches_expiry        ON pharmacy_batches (expiry_date);
CREATE INDEX idx_pharmacy_batches_batch_number  ON pharmacy_batches (pharmacy_id, batch_number);
CREATE INDEX idx_pharmacy_batches_status        ON pharmacy_batches (status) WHERE status = 'active';
CREATE INDEX idx_pharmacy_batches_fefo          ON pharmacy_batches (product_id, expiry_date ASC)
  WHERE status = 'active' AND quantity_available > 0;

-- pharmacy_suppliers
CREATE INDEX idx_pharmacy_suppliers_pharmacy    ON pharmacy_suppliers (pharmacy_id);
CREATE INDEX idx_pharmacy_suppliers_rif         ON pharmacy_suppliers (rif) WHERE rif IS NOT NULL;

-- pharmacy_purchase_orders
CREATE INDEX idx_pharmacy_po_pharmacy           ON pharmacy_purchase_orders (pharmacy_id);
CREATE INDEX idx_pharmacy_po_supplier           ON pharmacy_purchase_orders (supplier_id);
CREATE INDEX idx_pharmacy_po_status             ON pharmacy_purchase_orders (pharmacy_id, status);
CREATE INDEX idx_pharmacy_po_created            ON pharmacy_purchase_orders (created_at DESC);

-- pharmacy_purchase_order_items
CREATE INDEX idx_pharmacy_poi_order             ON pharmacy_purchase_order_items (purchase_order_id);
CREATE INDEX idx_pharmacy_poi_product           ON pharmacy_purchase_order_items (product_id);

-- pharmacy_invoices
CREATE INDEX idx_pharmacy_invoices_pharmacy     ON pharmacy_invoices (pharmacy_id);
CREATE INDEX idx_pharmacy_invoices_created      ON pharmacy_invoices (created_at DESC);
CREATE INDEX idx_pharmacy_invoices_status       ON pharmacy_invoices (pharmacy_id, status);
CREATE INDEX idx_pharmacy_invoices_cashier      ON pharmacy_invoices (cashier_id);
CREATE INDEX idx_pharmacy_invoices_prescription ON pharmacy_invoices (prescription_id) WHERE prescription_id IS NOT NULL;
CREATE INDEX idx_pharmacy_invoices_customer_ci  ON pharmacy_invoices (customer_ci) WHERE customer_ci IS NOT NULL;

-- pharmacy_invoice_items
CREATE INDEX idx_pharmacy_inv_items_invoice     ON pharmacy_invoice_items (invoice_id);
CREATE INDEX idx_pharmacy_inv_items_product     ON pharmacy_invoice_items (product_id);
CREATE INDEX idx_pharmacy_inv_items_batch       ON pharmacy_invoice_items (batch_id) WHERE batch_id IS NOT NULL;

-- pharmacy_cash_sessions
CREATE INDEX idx_pharmacy_cash_pharmacy         ON pharmacy_cash_sessions (pharmacy_id);
CREATE INDEX idx_pharmacy_cash_cashier          ON pharmacy_cash_sessions (cashier_id);
CREATE INDEX idx_pharmacy_cash_status           ON pharmacy_cash_sessions (pharmacy_id, status);

-- pharmacy_staff
CREATE INDEX idx_pharmacy_staff_pharmacy        ON pharmacy_staff (pharmacy_id);
CREATE INDEX idx_pharmacy_staff_profile         ON pharmacy_staff (profile_id);

-- pharmacy_alerts
CREATE INDEX idx_pharmacy_alerts_pharmacy       ON pharmacy_alerts (pharmacy_id);
CREATE INDEX idx_pharmacy_alerts_type           ON pharmacy_alerts (pharmacy_id, alert_type);
CREATE INDEX idx_pharmacy_alerts_unread         ON pharmacy_alerts (pharmacy_id, is_read) WHERE is_read = false;
CREATE INDEX idx_pharmacy_alerts_unresolved     ON pharmacy_alerts (pharmacy_id, is_resolved) WHERE is_resolved = false;
CREATE INDEX idx_pharmacy_alerts_created        ON pharmacy_alerts (created_at DESC);

-- pharmacy_deliveries
CREATE INDEX idx_pharmacy_deliveries_pharmacy   ON pharmacy_deliveries (pharmacy_id);
CREATE INDEX idx_pharmacy_deliveries_status     ON pharmacy_deliveries (pharmacy_id, status);
CREATE INDEX idx_pharmacy_deliveries_person     ON pharmacy_deliveries (delivery_person_id) WHERE delivery_person_id IS NOT NULL;
CREATE INDEX idx_pharmacy_deliveries_invoice    ON pharmacy_deliveries (invoice_id) WHERE invoice_id IS NOT NULL;

-- pharmacy_delivery_zones
CREATE INDEX idx_pharmacy_dzones_pharmacy       ON pharmacy_delivery_zones (pharmacy_id);

-- pharmacy_loyalty_members
CREATE INDEX idx_pharmacy_loyalty_members_pharmacy ON pharmacy_loyalty_members (pharmacy_id);
CREATE INDEX idx_pharmacy_loyalty_members_ci       ON pharmacy_loyalty_members (customer_ci) WHERE customer_ci IS NOT NULL;

-- pharmacy_loyalty_transactions
CREATE INDEX idx_pharmacy_loyalty_tx_member     ON pharmacy_loyalty_transactions (member_id);
CREATE INDEX idx_pharmacy_loyalty_tx_pharmacy   ON pharmacy_loyalty_transactions (pharmacy_id);
CREATE INDEX idx_pharmacy_loyalty_tx_created    ON pharmacy_loyalty_transactions (created_at DESC);

-- pharmacy_insurance_contracts
CREATE INDEX idx_pharmacy_insurance_pharmacy    ON pharmacy_insurance_contracts (pharmacy_id);
CREATE INDEX idx_pharmacy_insurance_active      ON pharmacy_insurance_contracts (pharmacy_id, is_active) WHERE is_active = true;


-- ============================================================================
-- 4. HELPER FUNCTIONS
-- ============================================================================

-- -------------------------------------------------------
-- 4.1  Resolve pharmacy_id for the current authenticated user.
--      Returns the pharmacy_details.id where profile_id = auth.uid()
--      OR where the user is a pharmacy_staff member.
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION pharmacy_id_for_current_user()
RETURNS SETOF uuid
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  -- Owner (pharmacy_details.profile_id = auth.uid())
  SELECT id FROM pharmacy_details WHERE profile_id = auth.uid()
  UNION
  -- Staff member
  SELECT pharmacy_id FROM pharmacy_staff WHERE profile_id = auth.uid() AND is_active = true;
$$;

-- -------------------------------------------------------
-- 4.2  Check if the current user belongs to a specific pharmacy
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION pharmacy_user_has_access(p_pharmacy_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM pharmacy_details WHERE id = p_pharmacy_id AND profile_id = auth.uid()
    UNION ALL
    SELECT 1 FROM pharmacy_staff WHERE pharmacy_id = p_pharmacy_id AND profile_id = auth.uid() AND is_active = true
  );
$$;

-- -------------------------------------------------------
-- 4.3  FEFO: Get the next batch to dispense for a product
--       (First Expired, First Out — active batches with stock, sorted by expiry ASC)
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION pharmacy_fefo_next_batch(p_product_id uuid, p_quantity integer DEFAULT 1)
RETURNS TABLE (
  batch_id          uuid,
  batch_number      text,
  expiry_date       date,
  quantity_available integer,
  allocate_qty      integer
)
LANGUAGE plpgsql STABLE
SET search_path = public
AS $$
DECLARE
  remaining integer := p_quantity;
  rec record;
BEGIN
  FOR rec IN
    SELECT b.id, b.batch_number, b.expiry_date, b.quantity_available
    FROM pharmacy_batches b
    WHERE b.product_id = p_product_id
      AND b.status = 'active'
      AND b.quantity_available > 0
      AND b.expiry_date > CURRENT_DATE
    ORDER BY b.expiry_date ASC, b.received_at ASC
  LOOP
    IF remaining <= 0 THEN EXIT; END IF;

    batch_id          := rec.id;
    batch_number      := rec.batch_number;
    expiry_date       := rec.expiry_date;
    quantity_available := rec.quantity_available;
    allocate_qty      := LEAST(rec.quantity_available, remaining);
    remaining         := remaining - allocate_qty;

    RETURN NEXT;
  END LOOP;
END;
$$;

-- -------------------------------------------------------
-- 4.4  Get total available stock for a product (across all active batches)
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION pharmacy_product_total_stock(p_product_id uuid)
RETURNS integer
LANGUAGE sql STABLE
SET search_path = public
AS $$
  SELECT COALESCE(SUM(quantity_available), 0)::integer
  FROM pharmacy_batches
  WHERE product_id = p_product_id
    AND status = 'active'
    AND quantity_available > 0;
$$;


-- ============================================================================
-- 5. TRIGGERS
-- ============================================================================

-- -------------------------------------------------------
-- 5.1  updated_at trigger function (reusable)
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION pharmacy_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply updated_at triggers to all tables with updated_at column
CREATE TRIGGER trg_pharmacy_products_updated_at    BEFORE UPDATE ON pharmacy_products    FOR EACH ROW EXECUTE FUNCTION pharmacy_set_updated_at();
CREATE TRIGGER trg_pharmacy_batches_updated_at     BEFORE UPDATE ON pharmacy_batches     FOR EACH ROW EXECUTE FUNCTION pharmacy_set_updated_at();
CREATE TRIGGER trg_pharmacy_suppliers_updated_at   BEFORE UPDATE ON pharmacy_suppliers   FOR EACH ROW EXECUTE FUNCTION pharmacy_set_updated_at();
CREATE TRIGGER trg_pharmacy_po_updated_at          BEFORE UPDATE ON pharmacy_purchase_orders FOR EACH ROW EXECUTE FUNCTION pharmacy_set_updated_at();
CREATE TRIGGER trg_pharmacy_invoices_updated_at    BEFORE UPDATE ON pharmacy_invoices    FOR EACH ROW EXECUTE FUNCTION pharmacy_set_updated_at();
CREATE TRIGGER trg_pharmacy_staff_updated_at       BEFORE UPDATE ON pharmacy_staff       FOR EACH ROW EXECUTE FUNCTION pharmacy_set_updated_at();
CREATE TRIGGER trg_pharmacy_deliveries_updated_at  BEFORE UPDATE ON pharmacy_deliveries  FOR EACH ROW EXECUTE FUNCTION pharmacy_set_updated_at();
CREATE TRIGGER trg_pharmacy_settings_updated_at    BEFORE UPDATE ON pharmacy_settings    FOR EACH ROW EXECUTE FUNCTION pharmacy_set_updated_at();

-- -------------------------------------------------------
-- 5.2  Auto-expire batches (runs on UPDATE to pharmacy_batches)
--       Sets status = 'expired' when expiry_date <= CURRENT_DATE
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION pharmacy_auto_expire_batch()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.expiry_date <= CURRENT_DATE AND NEW.status = 'active' THEN
    NEW.status := 'expired';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_pharmacy_batch_auto_expire
  BEFORE INSERT OR UPDATE ON pharmacy_batches
  FOR EACH ROW
  EXECUTE FUNCTION pharmacy_auto_expire_batch();

-- -------------------------------------------------------
-- 5.3  Auto-deplete batch (set status = 'depleted' when qty = 0)
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION pharmacy_auto_deplete_batch()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.quantity_available = 0 AND NEW.status = 'active' THEN
    NEW.status := 'depleted';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_pharmacy_batch_auto_deplete
  BEFORE UPDATE ON pharmacy_batches
  FOR EACH ROW
  EXECUTE FUNCTION pharmacy_auto_deplete_batch();

-- -------------------------------------------------------
-- 5.4  Sync pharmacy_inventory.stock_quantity when batches change
--       Updates the legacy pharmacy_inventory table to keep stock in sync.
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION pharmacy_sync_inventory_stock()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_product_name text;
  v_total_stock integer;
BEGIN
  -- Get the product name from pharmacy_products
  SELECT name INTO v_product_name
  FROM pharmacy_products
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);

  -- Calculate total stock across all active batches
  SELECT COALESCE(SUM(quantity_available), 0)::integer INTO v_total_stock
  FROM pharmacy_batches
  WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
    AND status = 'active';

  -- Update pharmacy_inventory if a matching row exists
  UPDATE pharmacy_inventory
  SET stock_quantity = v_total_stock,
      in_stock = (v_total_stock > 0),
      updated_at = now()
  WHERE pharmacy_id = COALESCE(NEW.pharmacy_id, OLD.pharmacy_id)
    AND medication_name = v_product_name;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_pharmacy_batch_sync_inventory
  AFTER INSERT OR UPDATE OR DELETE ON pharmacy_batches
  FOR EACH ROW
  EXECUTE FUNCTION pharmacy_sync_inventory_stock();

-- -------------------------------------------------------
-- 5.5  Generate low-stock alert when batch quantity changes
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION pharmacy_check_low_stock_alert()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_total_stock integer;
  v_product record;
  v_threshold integer;
BEGIN
  -- Get product details
  SELECT * INTO v_product
  FROM pharmacy_products
  WHERE id = NEW.product_id;

  IF NOT FOUND THEN RETURN NEW; END IF;

  -- Get pharmacy threshold setting (default 10)
  SELECT COALESCE(s.low_stock_threshold, 10) INTO v_threshold
  FROM pharmacy_settings s
  WHERE s.pharmacy_id = NEW.pharmacy_id;

  IF NOT FOUND THEN v_threshold := 10; END IF;

  -- Calculate total stock
  v_total_stock := pharmacy_product_total_stock(NEW.product_id);

  -- Out of stock
  IF v_total_stock = 0 THEN
    INSERT INTO pharmacy_alerts (pharmacy_id, alert_type, severity, title, message, related_product_id)
    VALUES (
      NEW.pharmacy_id,
      'out_of_stock',
      'critical',
      'Producto agotado: ' || v_product.name,
      'El producto "' || v_product.name || '" no tiene stock disponible.',
      v_product.id
    )
    ON CONFLICT DO NOTHING;

  -- Low stock
  ELSIF v_total_stock <= COALESCE(v_product.reorder_point, v_threshold) THEN
    INSERT INTO pharmacy_alerts (pharmacy_id, alert_type, severity, title, message, related_product_id)
    VALUES (
      NEW.pharmacy_id,
      'low_stock',
      'warning',
      'Stock bajo: ' || v_product.name,
      'El producto "' || v_product.name || '" tiene solo ' || v_total_stock || ' unidades disponibles.',
      v_product.id
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_pharmacy_batch_low_stock_alert
  AFTER UPDATE OF quantity_available ON pharmacy_batches
  FOR EACH ROW
  WHEN (NEW.quantity_available < OLD.quantity_available)
  EXECUTE FUNCTION pharmacy_check_low_stock_alert();

-- -------------------------------------------------------
-- 5.6  Generate expiry warning alerts
--       Called by a cron or on batch insert/update
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION pharmacy_check_expiry_alerts()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_warning_days integer;
  v_product_name text;
  v_days_until_expiry integer;
BEGIN
  IF NEW.status != 'active' OR NEW.quantity_available <= 0 THEN
    RETURN NEW;
  END IF;

  -- Get warning threshold
  SELECT COALESCE(s.expiry_warning_days, 90) INTO v_warning_days
  FROM pharmacy_settings s
  WHERE s.pharmacy_id = NEW.pharmacy_id;

  IF NOT FOUND THEN v_warning_days := 90; END IF;

  -- Get product name
  SELECT name INTO v_product_name
  FROM pharmacy_products
  WHERE id = NEW.product_id;

  v_days_until_expiry := NEW.expiry_date - CURRENT_DATE;

  -- Critical: expires within 30 days
  IF v_days_until_expiry <= 30 AND v_days_until_expiry > 0 THEN
    INSERT INTO pharmacy_alerts (pharmacy_id, alert_type, severity, title, message, related_product_id, related_batch_id)
    VALUES (
      NEW.pharmacy_id,
      'expiry_critical',
      'critical',
      'Vencimiento inminente: ' || COALESCE(v_product_name, 'Producto'),
      'Lote ' || NEW.batch_number || ' vence en ' || v_days_until_expiry || ' dias (' || NEW.expiry_date || '). ' || NEW.quantity_available || ' unidades.',
      NEW.product_id,
      NEW.id
    );

  -- Warning: expires within configured threshold
  ELSIF v_days_until_expiry <= v_warning_days AND v_days_until_expiry > 30 THEN
    INSERT INTO pharmacy_alerts (pharmacy_id, alert_type, severity, title, message, related_product_id, related_batch_id)
    VALUES (
      NEW.pharmacy_id,
      'expiry_warning',
      'warning',
      'Proxima a vencer: ' || COALESCE(v_product_name, 'Producto'),
      'Lote ' || NEW.batch_number || ' vence el ' || NEW.expiry_date || '. ' || NEW.quantity_available || ' unidades.',
      NEW.product_id,
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_pharmacy_batch_expiry_alert
  AFTER INSERT OR UPDATE ON pharmacy_batches
  FOR EACH ROW
  EXECUTE FUNCTION pharmacy_check_expiry_alerts();

-- -------------------------------------------------------
-- 5.7  Deduct batch stock on invoice item creation (FEFO)
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION pharmacy_deduct_batch_on_sale()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- If batch_id is specified, deduct from that specific batch
  IF NEW.batch_id IS NOT NULL THEN
    UPDATE pharmacy_batches
    SET quantity_available = quantity_available - NEW.quantity,
        quantity_sold = quantity_sold + NEW.quantity
    WHERE id = NEW.batch_id
      AND quantity_available >= NEW.quantity;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Insufficient stock in batch % for product', NEW.batch_id;
    END IF;
  END IF;
  -- If no batch_id, the app layer should have used pharmacy_fefo_next_batch()
  -- and set batch_id before insert. We don't auto-select here to avoid hidden logic.

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_pharmacy_invoice_item_deduct_stock
  AFTER INSERT ON pharmacy_invoice_items
  FOR EACH ROW
  EXECUTE FUNCTION pharmacy_deduct_batch_on_sale();

-- -------------------------------------------------------
-- 5.8  Restore batch stock on invoice void
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION pharmacy_restore_stock_on_void()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'voided' AND OLD.status != 'voided' THEN
    -- Restore stock for each invoice item that has a batch_id
    UPDATE pharmacy_batches b
    SET quantity_available = b.quantity_available + ii.quantity,
        quantity_sold = GREATEST(b.quantity_sold - ii.quantity, 0),
        status = CASE
          WHEN b.expiry_date > CURRENT_DATE AND (b.quantity_available + ii.quantity) > 0 THEN 'active'
          ELSE b.status
        END
    FROM pharmacy_invoice_items ii
    WHERE ii.invoice_id = NEW.id
      AND ii.batch_id = b.id;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_pharmacy_invoice_void_restore_stock
  AFTER UPDATE OF status ON pharmacy_invoices
  FOR EACH ROW
  WHEN (NEW.status = 'voided' AND OLD.status != 'voided')
  EXECUTE FUNCTION pharmacy_restore_stock_on_void();


-- ============================================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE pharmacy_products              ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_batches               ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_suppliers             ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_purchase_orders       ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_purchase_order_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_invoices              ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_invoice_items         ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_cash_sessions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_staff                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_alerts                ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_delivery_zones        ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_deliveries            ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_loyalty_programs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_loyalty_members       ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_loyalty_transactions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_settings              ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_insurance_contracts   ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------
-- 6.1  pharmacy_products — staff CRUD, public read (active only)
-- -------------------------------------------------------
CREATE POLICY pharmacy_products_select_public
  ON pharmacy_products FOR SELECT
  USING (is_active = true);

CREATE POLICY pharmacy_products_select_staff
  ON pharmacy_products FOR SELECT
  USING (pharmacy_user_has_access(pharmacy_id));

CREATE POLICY pharmacy_products_insert
  ON pharmacy_products FOR INSERT
  WITH CHECK (pharmacy_user_has_access(pharmacy_id));

CREATE POLICY pharmacy_products_update
  ON pharmacy_products FOR UPDATE
  USING (pharmacy_user_has_access(pharmacy_id))
  WITH CHECK (pharmacy_user_has_access(pharmacy_id));

CREATE POLICY pharmacy_products_delete
  ON pharmacy_products FOR DELETE
  USING (pharmacy_user_has_access(pharmacy_id));

-- -------------------------------------------------------
-- 6.2  pharmacy_batches — staff only
-- -------------------------------------------------------
CREATE POLICY pharmacy_batches_select
  ON pharmacy_batches FOR SELECT
  USING (pharmacy_user_has_access(pharmacy_id));

CREATE POLICY pharmacy_batches_insert
  ON pharmacy_batches FOR INSERT
  WITH CHECK (pharmacy_user_has_access(pharmacy_id));

CREATE POLICY pharmacy_batches_update
  ON pharmacy_batches FOR UPDATE
  USING (pharmacy_user_has_access(pharmacy_id))
  WITH CHECK (pharmacy_user_has_access(pharmacy_id));

CREATE POLICY pharmacy_batches_delete
  ON pharmacy_batches FOR DELETE
  USING (pharmacy_user_has_access(pharmacy_id));

-- -------------------------------------------------------
-- 6.3  pharmacy_suppliers — staff only
-- -------------------------------------------------------
CREATE POLICY pharmacy_suppliers_select
  ON pharmacy_suppliers FOR SELECT
  USING (pharmacy_user_has_access(pharmacy_id));

CREATE POLICY pharmacy_suppliers_insert
  ON pharmacy_suppliers FOR INSERT
  WITH CHECK (pharmacy_user_has_access(pharmacy_id));

CREATE POLICY pharmacy_suppliers_update
  ON pharmacy_suppliers FOR UPDATE
  USING (pharmacy_user_has_access(pharmacy_id))
  WITH CHECK (pharmacy_user_has_access(pharmacy_id));

CREATE POLICY pharmacy_suppliers_delete
  ON pharmacy_suppliers FOR DELETE
  USING (pharmacy_user_has_access(pharmacy_id));

-- -------------------------------------------------------
-- 6.4  pharmacy_purchase_orders — staff only
-- -------------------------------------------------------
CREATE POLICY pharmacy_po_select
  ON pharmacy_purchase_orders FOR SELECT
  USING (pharmacy_user_has_access(pharmacy_id));

CREATE POLICY pharmacy_po_insert
  ON pharmacy_purchase_orders FOR INSERT
  WITH CHECK (pharmacy_user_has_access(pharmacy_id));

CREATE POLICY pharmacy_po_update
  ON pharmacy_purchase_orders FOR UPDATE
  USING (pharmacy_user_has_access(pharmacy_id))
  WITH CHECK (pharmacy_user_has_access(pharmacy_id));

CREATE POLICY pharmacy_po_delete
  ON pharmacy_purchase_orders FOR DELETE
  USING (pharmacy_user_has_access(pharmacy_id));

-- -------------------------------------------------------
-- 6.5  pharmacy_purchase_order_items — inherit from parent PO
-- -------------------------------------------------------
CREATE POLICY pharmacy_poi_select
  ON pharmacy_purchase_order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM pharmacy_purchase_orders po
      WHERE po.id = purchase_order_id
        AND pharmacy_user_has_access(po.pharmacy_id)
    )
  );

CREATE POLICY pharmacy_poi_insert
  ON pharmacy_purchase_order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pharmacy_purchase_orders po
      WHERE po.id = purchase_order_id
        AND pharmacy_user_has_access(po.pharmacy_id)
    )
  );

CREATE POLICY pharmacy_poi_update
  ON pharmacy_purchase_order_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM pharmacy_purchase_orders po
      WHERE po.id = purchase_order_id
        AND pharmacy_user_has_access(po.pharmacy_id)
    )
  );

CREATE POLICY pharmacy_poi_delete
  ON pharmacy_purchase_order_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM pharmacy_purchase_orders po
      WHERE po.id = purchase_order_id
        AND pharmacy_user_has_access(po.pharmacy_id)
    )
  );

-- -------------------------------------------------------
-- 6.6  pharmacy_invoices — staff only
-- -------------------------------------------------------
CREATE POLICY pharmacy_invoices_select
  ON pharmacy_invoices FOR SELECT
  USING (pharmacy_user_has_access(pharmacy_id));

CREATE POLICY pharmacy_invoices_insert
  ON pharmacy_invoices FOR INSERT
  WITH CHECK (pharmacy_user_has_access(pharmacy_id));

CREATE POLICY pharmacy_invoices_update
  ON pharmacy_invoices FOR UPDATE
  USING (pharmacy_user_has_access(pharmacy_id))
  WITH CHECK (pharmacy_user_has_access(pharmacy_id));

-- No DELETE — invoices should only be voided, never deleted

-- -------------------------------------------------------
-- 6.7  pharmacy_invoice_items — inherit from parent invoice
-- -------------------------------------------------------
CREATE POLICY pharmacy_inv_items_select
  ON pharmacy_invoice_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM pharmacy_invoices inv
      WHERE inv.id = invoice_id
        AND pharmacy_user_has_access(inv.pharmacy_id)
    )
  );

CREATE POLICY pharmacy_inv_items_insert
  ON pharmacy_invoice_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pharmacy_invoices inv
      WHERE inv.id = invoice_id
        AND pharmacy_user_has_access(inv.pharmacy_id)
    )
  );

-- No UPDATE or DELETE on invoice items — void the whole invoice instead

-- -------------------------------------------------------
-- 6.8  pharmacy_cash_sessions — staff only
-- -------------------------------------------------------
CREATE POLICY pharmacy_cash_select
  ON pharmacy_cash_sessions FOR SELECT
  USING (pharmacy_user_has_access(pharmacy_id));

CREATE POLICY pharmacy_cash_insert
  ON pharmacy_cash_sessions FOR INSERT
  WITH CHECK (pharmacy_user_has_access(pharmacy_id));

CREATE POLICY pharmacy_cash_update
  ON pharmacy_cash_sessions FOR UPDATE
  USING (pharmacy_user_has_access(pharmacy_id))
  WITH CHECK (pharmacy_user_has_access(pharmacy_id));

-- -------------------------------------------------------
-- 6.9  pharmacy_staff — owner/manager can manage, staff can see own
-- -------------------------------------------------------
CREATE POLICY pharmacy_staff_select
  ON pharmacy_staff FOR SELECT
  USING (pharmacy_user_has_access(pharmacy_id));

CREATE POLICY pharmacy_staff_insert
  ON pharmacy_staff FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pharmacy_details pd
      WHERE pd.id = pharmacy_id AND pd.profile_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM pharmacy_staff ps
      WHERE ps.pharmacy_id = pharmacy_staff.pharmacy_id
        AND ps.profile_id = auth.uid()
        AND ps.role IN ('owner', 'manager')
        AND ps.is_active = true
    )
  );

CREATE POLICY pharmacy_staff_update
  ON pharmacy_staff FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM pharmacy_details pd
      WHERE pd.id = pharmacy_id AND pd.profile_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM pharmacy_staff ps
      WHERE ps.pharmacy_id = pharmacy_staff.pharmacy_id
        AND ps.profile_id = auth.uid()
        AND ps.role IN ('owner', 'manager')
        AND ps.is_active = true
    )
  );

CREATE POLICY pharmacy_staff_delete
  ON pharmacy_staff FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM pharmacy_details pd
      WHERE pd.id = pharmacy_id AND pd.profile_id = auth.uid()
    )
  );

-- -------------------------------------------------------
-- 6.10  pharmacy_alerts — staff only
-- -------------------------------------------------------
CREATE POLICY pharmacy_alerts_select
  ON pharmacy_alerts FOR SELECT
  USING (pharmacy_user_has_access(pharmacy_id));

CREATE POLICY pharmacy_alerts_update
  ON pharmacy_alerts FOR UPDATE
  USING (pharmacy_user_has_access(pharmacy_id))
  WITH CHECK (pharmacy_user_has_access(pharmacy_id));

-- Alerts are system-generated, no manual insert/delete via RLS
-- (triggers insert them with SECURITY DEFINER)

-- -------------------------------------------------------
-- 6.11  pharmacy_delivery_zones — staff CRUD, public read active
-- -------------------------------------------------------
CREATE POLICY pharmacy_dzones_select_public
  ON pharmacy_delivery_zones FOR SELECT
  USING (is_active = true);

CREATE POLICY pharmacy_dzones_select_staff
  ON pharmacy_delivery_zones FOR SELECT
  USING (pharmacy_user_has_access(pharmacy_id));

CREATE POLICY pharmacy_dzones_insert
  ON pharmacy_delivery_zones FOR INSERT
  WITH CHECK (pharmacy_user_has_access(pharmacy_id));

CREATE POLICY pharmacy_dzones_update
  ON pharmacy_delivery_zones FOR UPDATE
  USING (pharmacy_user_has_access(pharmacy_id))
  WITH CHECK (pharmacy_user_has_access(pharmacy_id));

CREATE POLICY pharmacy_dzones_delete
  ON pharmacy_delivery_zones FOR DELETE
  USING (pharmacy_user_has_access(pharmacy_id));

-- -------------------------------------------------------
-- 6.12  pharmacy_deliveries — staff only
-- -------------------------------------------------------
CREATE POLICY pharmacy_deliveries_select
  ON pharmacy_deliveries FOR SELECT
  USING (pharmacy_user_has_access(pharmacy_id));

CREATE POLICY pharmacy_deliveries_insert
  ON pharmacy_deliveries FOR INSERT
  WITH CHECK (pharmacy_user_has_access(pharmacy_id));

CREATE POLICY pharmacy_deliveries_update
  ON pharmacy_deliveries FOR UPDATE
  USING (pharmacy_user_has_access(pharmacy_id))
  WITH CHECK (pharmacy_user_has_access(pharmacy_id));

-- -------------------------------------------------------
-- 6.13  pharmacy_loyalty_programs — staff CRUD
-- -------------------------------------------------------
CREATE POLICY pharmacy_loyalty_prog_select
  ON pharmacy_loyalty_programs FOR SELECT
  USING (pharmacy_user_has_access(pharmacy_id));

CREATE POLICY pharmacy_loyalty_prog_insert
  ON pharmacy_loyalty_programs FOR INSERT
  WITH CHECK (pharmacy_user_has_access(pharmacy_id));

CREATE POLICY pharmacy_loyalty_prog_update
  ON pharmacy_loyalty_programs FOR UPDATE
  USING (pharmacy_user_has_access(pharmacy_id))
  WITH CHECK (pharmacy_user_has_access(pharmacy_id));

-- -------------------------------------------------------
-- 6.14  pharmacy_loyalty_members — staff CRUD
-- -------------------------------------------------------
CREATE POLICY pharmacy_loyalty_members_select
  ON pharmacy_loyalty_members FOR SELECT
  USING (pharmacy_user_has_access(pharmacy_id));

CREATE POLICY pharmacy_loyalty_members_insert
  ON pharmacy_loyalty_members FOR INSERT
  WITH CHECK (pharmacy_user_has_access(pharmacy_id));

CREATE POLICY pharmacy_loyalty_members_update
  ON pharmacy_loyalty_members FOR UPDATE
  USING (pharmacy_user_has_access(pharmacy_id))
  WITH CHECK (pharmacy_user_has_access(pharmacy_id));

-- -------------------------------------------------------
-- 6.15  pharmacy_loyalty_transactions — staff insert + select
-- -------------------------------------------------------
CREATE POLICY pharmacy_loyalty_tx_select
  ON pharmacy_loyalty_transactions FOR SELECT
  USING (pharmacy_user_has_access(pharmacy_id));

CREATE POLICY pharmacy_loyalty_tx_insert
  ON pharmacy_loyalty_transactions FOR INSERT
  WITH CHECK (pharmacy_user_has_access(pharmacy_id));

-- -------------------------------------------------------
-- 6.16  pharmacy_settings — staff CRUD
-- -------------------------------------------------------
CREATE POLICY pharmacy_settings_select
  ON pharmacy_settings FOR SELECT
  USING (pharmacy_user_has_access(pharmacy_id));

CREATE POLICY pharmacy_settings_insert
  ON pharmacy_settings FOR INSERT
  WITH CHECK (pharmacy_user_has_access(pharmacy_id));

CREATE POLICY pharmacy_settings_update
  ON pharmacy_settings FOR UPDATE
  USING (pharmacy_user_has_access(pharmacy_id))
  WITH CHECK (pharmacy_user_has_access(pharmacy_id));

-- -------------------------------------------------------
-- 6.17  pharmacy_insurance_contracts — staff CRUD
-- -------------------------------------------------------
CREATE POLICY pharmacy_insurance_select
  ON pharmacy_insurance_contracts FOR SELECT
  USING (pharmacy_user_has_access(pharmacy_id));

CREATE POLICY pharmacy_insurance_insert
  ON pharmacy_insurance_contracts FOR INSERT
  WITH CHECK (pharmacy_user_has_access(pharmacy_id));

CREATE POLICY pharmacy_insurance_update
  ON pharmacy_insurance_contracts FOR UPDATE
  USING (pharmacy_user_has_access(pharmacy_id))
  WITH CHECK (pharmacy_user_has_access(pharmacy_id));

CREATE POLICY pharmacy_insurance_delete
  ON pharmacy_insurance_contracts FOR DELETE
  USING (pharmacy_user_has_access(pharmacy_id));


-- ============================================================================
-- 7. DASHBOARD VIEW
-- ============================================================================

CREATE OR REPLACE VIEW pharmacy_dashboard_stats AS
SELECT
  pd.id AS pharmacy_id,
  pd.business_name,

  -- Product stats
  (SELECT count(*) FROM pharmacy_products p WHERE p.pharmacy_id = pd.id AND p.is_active = true)::integer AS total_active_products,
  (SELECT count(*) FROM pharmacy_products p WHERE p.pharmacy_id = pd.id AND p.is_active = true
    AND pharmacy_product_total_stock(p.id) = 0)::integer AS out_of_stock_products,
  (SELECT count(*) FROM pharmacy_products p WHERE p.pharmacy_id = pd.id AND p.is_active = true
    AND pharmacy_product_total_stock(p.id) > 0
    AND pharmacy_product_total_stock(p.id) <= p.reorder_point)::integer AS low_stock_products,

  -- Batch / expiry stats
  (SELECT count(*) FROM pharmacy_batches b WHERE b.pharmacy_id = pd.id AND b.status = 'active'
    AND b.expiry_date <= CURRENT_DATE + interval '30 days' AND b.expiry_date > CURRENT_DATE
    AND b.quantity_available > 0)::integer AS batches_expiring_30d,
  (SELECT count(*) FROM pharmacy_batches b WHERE b.pharmacy_id = pd.id AND b.status = 'expired')::integer AS expired_batches,

  -- Today's sales
  (SELECT count(*) FROM pharmacy_invoices i WHERE i.pharmacy_id = pd.id AND i.status = 'completed'
    AND i.created_at::date = CURRENT_DATE)::integer AS today_invoice_count,
  (SELECT COALESCE(sum(i.total_usd), 0) FROM pharmacy_invoices i WHERE i.pharmacy_id = pd.id AND i.status = 'completed'
    AND i.created_at::date = CURRENT_DATE)::numeric(12,2) AS today_sales_usd,
  (SELECT COALESCE(sum(i.total_bs), 0) FROM pharmacy_invoices i WHERE i.pharmacy_id = pd.id AND i.status = 'completed'
    AND i.created_at::date = CURRENT_DATE)::numeric(12,2) AS today_sales_bs,

  -- Monthly sales (current month)
  (SELECT count(*) FROM pharmacy_invoices i WHERE i.pharmacy_id = pd.id AND i.status = 'completed'
    AND i.created_at >= date_trunc('month', CURRENT_DATE))::integer AS month_invoice_count,
  (SELECT COALESCE(sum(i.total_usd), 0) FROM pharmacy_invoices i WHERE i.pharmacy_id = pd.id AND i.status = 'completed'
    AND i.created_at >= date_trunc('month', CURRENT_DATE))::numeric(12,2) AS month_sales_usd,

  -- Pending deliveries
  (SELECT count(*) FROM pharmacy_deliveries d WHERE d.pharmacy_id = pd.id
    AND d.status IN ('pending', 'assigned', 'in_transit'))::integer AS pending_deliveries,

  -- Pending purchase orders
  (SELECT count(*) FROM pharmacy_purchase_orders po WHERE po.pharmacy_id = pd.id
    AND po.status IN ('sent', 'confirmed', 'partial'))::integer AS pending_purchase_orders,

  -- Unread alerts
  (SELECT count(*) FROM pharmacy_alerts a WHERE a.pharmacy_id = pd.id AND a.is_read = false)::integer AS unread_alerts,
  (SELECT count(*) FROM pharmacy_alerts a WHERE a.pharmacy_id = pd.id AND a.is_read = false AND a.severity = 'critical')::integer AS critical_alerts,

  -- Loyalty members
  (SELECT count(*) FROM pharmacy_loyalty_members lm WHERE lm.pharmacy_id = pd.id)::integer AS total_loyalty_members,

  -- Staff count
  (SELECT count(*) FROM pharmacy_staff s WHERE s.pharmacy_id = pd.id AND s.is_active = true)::integer AS active_staff_count

FROM pharmacy_details pd;

-- RLS on view: uses the underlying table policies via the pharmacy_details reference
COMMENT ON VIEW pharmacy_dashboard_stats IS 'Aggregated KPI dashboard for pharmacy management. Access controlled by pharmacy_details RLS.';


-- ============================================================================
-- 8. BATCH EXPIRY CRON HELPER
--    Call this function periodically (e.g., daily via pg_cron or edge function)
--    to bulk-expire batches and generate alerts.
-- ============================================================================

CREATE OR REPLACE FUNCTION pharmacy_run_daily_expiry_check()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rec record;
BEGIN
  -- 1. Expire all batches past their expiry date
  UPDATE pharmacy_batches
  SET status = 'expired', updated_at = now()
  WHERE status = 'active' AND expiry_date <= CURRENT_DATE;

  -- 2. Generate expiry warning alerts for batches expiring within 90 days
  --    (the trigger on pharmacy_batches handles individual insert/update alerts,
  --     but this catches batches that are aging into the warning window)
  FOR rec IN
    SELECT b.id, b.pharmacy_id, b.product_id, b.batch_number, b.expiry_date, b.quantity_available,
           p.name AS product_name,
           COALESCE(s.expiry_warning_days, 90) AS warning_days
    FROM pharmacy_batches b
    JOIN pharmacy_products p ON p.id = b.product_id
    LEFT JOIN pharmacy_settings s ON s.pharmacy_id = b.pharmacy_id
    WHERE b.status = 'active'
      AND b.quantity_available > 0
      AND b.expiry_date > CURRENT_DATE
      AND b.expiry_date <= CURRENT_DATE + (COALESCE(s.expiry_warning_days, 90) || ' days')::interval
      AND NOT EXISTS (
        SELECT 1 FROM pharmacy_alerts a
        WHERE a.related_batch_id = b.id
          AND a.alert_type IN ('expiry_warning', 'expiry_critical')
          AND a.created_at > CURRENT_DATE - interval '7 days'
      )
  LOOP
    INSERT INTO pharmacy_alerts (pharmacy_id, alert_type, severity, title, message, related_product_id, related_batch_id)
    VALUES (
      rec.pharmacy_id,
      CASE WHEN (rec.expiry_date - CURRENT_DATE) <= 30 THEN 'expiry_critical' ELSE 'expiry_warning' END,
      CASE WHEN (rec.expiry_date - CURRENT_DATE) <= 30 THEN 'critical' ELSE 'warning' END,
      CASE WHEN (rec.expiry_date - CURRENT_DATE) <= 30
        THEN 'Vencimiento inminente: ' || rec.product_name
        ELSE 'Proxima a vencer: ' || rec.product_name
      END,
      'Lote ' || rec.batch_number || ' vence el ' || rec.expiry_date || '. ' || rec.quantity_available || ' unidades.',
      rec.product_id,
      rec.id
    );
  END LOOP;
END;
$$;

COMMENT ON FUNCTION pharmacy_run_daily_expiry_check() IS
  'Run daily (via pg_cron or edge function) to expire batches and generate expiry alerts.';


-- ============================================================================
-- 9. GRANTS (for supabase anon/authenticated roles)
-- ============================================================================

-- Authenticated users can access all pharmacy tables (RLS controls row-level access)
GRANT SELECT, INSERT, UPDATE, DELETE ON pharmacy_products              TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON pharmacy_batches               TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON pharmacy_suppliers             TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON pharmacy_purchase_orders       TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON pharmacy_purchase_order_items  TO authenticated;
GRANT SELECT, INSERT, UPDATE         ON pharmacy_invoices              TO authenticated;
GRANT SELECT, INSERT                 ON pharmacy_invoice_items         TO authenticated;
GRANT SELECT, INSERT, UPDATE         ON pharmacy_cash_sessions         TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON pharmacy_staff                 TO authenticated;
GRANT SELECT, UPDATE                 ON pharmacy_alerts                TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON pharmacy_delivery_zones        TO authenticated;
GRANT SELECT, INSERT, UPDATE         ON pharmacy_deliveries            TO authenticated;
GRANT SELECT, INSERT, UPDATE         ON pharmacy_loyalty_programs      TO authenticated;
GRANT SELECT, INSERT, UPDATE         ON pharmacy_loyalty_members       TO authenticated;
GRANT SELECT, INSERT                 ON pharmacy_loyalty_transactions  TO authenticated;
GRANT SELECT, INSERT, UPDATE         ON pharmacy_settings              TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON pharmacy_insurance_contracts   TO authenticated;
GRANT SELECT                         ON pharmacy_dashboard_stats       TO authenticated;

-- Anon users can read active products and delivery zones (public catalog)
GRANT SELECT ON pharmacy_products       TO anon;
GRANT SELECT ON pharmacy_delivery_zones TO anon;

COMMIT;
