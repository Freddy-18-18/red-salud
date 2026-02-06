-- ============================================================================
-- PHARMACY ERP/POS DATABASE MIGRATION
-- ============================================================================
-- Migration: 001_pharmacy_core_tables
-- Description: Core tables for pharmacy management system
-- ============================================================================

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE currency_enum AS ENUM ('VES', 'USD', 'EUR');
CREATE TYPE product_type_enum AS ENUM ('medicine', 'supply', 'food', 'cosmetic', 'equipment');
CREATE TYPE product_category_enum AS ENUM (
  'analgesic', 'antibiotic', 'antihypertensive', 'diabetes', 
  'cardiovascular', 'vitamins', 'dermatology', 'respiratory', 
  'gastrointestinal', 'psychotropic', 'controlled', 'other'
);
CREATE TYPE inventory_zone_enum AS ENUM ('available', 'quarantine', 'rejected', 'approved', 'damaged');
CREATE TYPE payment_method_enum AS ENUM ('cash', 'card', 'pago_movil', 'zelle', 'biopago', 'crypto', 'transfer', 'mixed');
CREATE TYPE invoice_status_enum AS ENUM ('draft', 'pending', 'paid', 'cancelled', 'refunded');
CREATE TYPE user_role_enum AS ENUM ('cashier', 'pharmacist', 'manager', 'admin', 'supervisor');
CREATE TYPE transaction_type_enum AS ENUM ('sale', 'purchase', 'transfer', 'adjustment', 'return');
CREATE TYPE report_type_enum AS ENUM ('x_cut', 'z_report', 'sales', 'inventory', 'profitability', 'psychotropic');
CREATE TYPE blood_type_enum AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');
CREATE TYPE unit_type_enum AS ENUM ('unit', 'box', 'blister', 'pack', 'bottle', 'tube');
CREATE TYPE warehouse_type_enum AS ENUM ('store', 'backroom', 'quarantine', 'central');
CREATE TYPE purchase_order_status_enum AS ENUM ('draft', 'sent', 'received', 'cancelled');
CREATE TYPE loyalty_program_type_enum AS ENUM ('manufacturer', 'pharmacy', 'combined');

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Users table (extends auth.users)
CREATE TABLE pharmacy_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  role user_role_enum NOT NULL DEFAULT 'cashier',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Warehouses
CREATE TABLE warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  type warehouse_type_enum NOT NULL DEFAULT 'store',
  address TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Suppliers
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  rif TEXT UNIQUE,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  payment_terms TEXT,
  credit_limit NUMERIC(15,2) DEFAULT 0,
  balance NUMERIC(15,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT UNIQUE NOT NULL,
  barcode TEXT UNIQUE,
  name TEXT NOT NULL,
  generic_name TEXT,
  active_ingredient TEXT,
  description TEXT,
  product_type product_type_enum NOT NULL DEFAULT 'medicine',
  category product_category_enum NOT NULL DEFAULT 'other',
  manufacturer TEXT,
  brand TEXT,
  
  -- Pricing
  cost_price_usd NUMERIC(15,2) NOT NULL DEFAULT 0,
  cost_price_ves NUMERIC(15,2) NOT NULL DEFAULT 0,
  sale_price_usd NUMERIC(15,2) NOT NULL DEFAULT 0,
  sale_price_ves NUMERIC(15,2) NOT NULL DEFAULT 0,
  wholesale_price_usd NUMERIC(15,2),
  wholesale_price_ves NUMERIC(15,2),
  
  -- Tax
  iva_rate NUMERIC(3,2) NOT NULL DEFAULT 0.16 CHECK (iva_rate >= 0 AND iva_rate <= 1),
  iva_exempt BOOLEAN DEFAULT false,
  
  -- Inventory
  min_stock INTEGER NOT NULL DEFAULT 10,
  max_stock INTEGER NOT NULL DEFAULT 100,
  reorder_point INTEGER NOT NULL DEFAULT 20,
  
  -- Units
  unit_type unit_type_enum NOT NULL DEFAULT 'unit',
  units_per_box INTEGER NOT NULL DEFAULT 1,
  allow_fractional_sale BOOLEAN DEFAULT false,
  
  -- Control flags
  requires_prescription BOOLEAN DEFAULT false,
  controlled_substance BOOLEAN DEFAULT false,
  psychotropic BOOLEAN DEFAULT false,
  refrigerated BOOLEAN DEFAULT false,
  
  -- Metadata
  image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  
  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES pharmacy_users(id)
);

-- Batches/Lots
CREATE TABLE batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  lot_number TEXT NOT NULL,
  expiry_date DATE NOT NULL,
  manufacturing_date DATE,
  
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  location TEXT, -- e.g., "A-12-3" (Aisle-Shelf-Position)
  zone inventory_zone_enum NOT NULL DEFAULT 'available',
  
  quantity INTEGER NOT NULL DEFAULT 0,
  original_quantity INTEGER NOT NULL DEFAULT 0,
  
  received_at TIMESTAMPTZ DEFAULT NOW(),
  supplier_id UUID REFERENCES suppliers(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT batches_lot_warehouse_unique UNIQUE (lot_number, warehouse_id)
);

-- Patients
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  ci TEXT UNIQUE,
  phone TEXT,
  email TEXT,
  date_of_birth DATE,
  blood_type blood_type_enum,
  allergies TEXT[] DEFAULT '{}',
  chronic_conditions TEXT[] DEFAULT '{}',
  medications TEXT[] DEFAULT '{}',
  
  address TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SALES & INVOICES
-- ============================================================================

CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT UNIQUE NOT NULL,
  fiscal_control_number TEXT UNIQUE,
  
  patient_id UUID REFERENCES patients(id),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id),
  user_id UUID NOT NULL REFERENCES pharmacy_users(id),
  
  status invoice_status_enum NOT NULL DEFAULT 'draft',
  
  -- Totals
  subtotal_usd NUMERIC(15,2) NOT NULL DEFAULT 0,
  subtotal_ves NUMERIC(15,2) NOT NULL DEFAULT 0,
  iva_usd NUMERIC(15,2) NOT NULL DEFAULT 0,
  iva_ves NUMERIC(15,2) NOT NULL DEFAULT 0,
  total_usd NUMERIC(15,2) NOT NULL DEFAULT 0,
  total_ves NUMERIC(15,2) NOT NULL DEFAULT 0,
  
  -- Payment
  payment_method payment_method_enum NOT NULL,
  payment_details JSONB, -- Stores mixed payment breakdown
  
  -- Currency conversion rate at time of sale
  exchange_rate NUMERIC(15,6) NOT NULL DEFAULT 1,
  
  -- Notes
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  
  product_id UUID NOT NULL REFERENCES products(id),
  batch_id UUID REFERENCES batches(id),
  
  product_name TEXT NOT NULL,
  generic_name TEXT,
  quantity NUMERIC(10,2) NOT NULL CHECK (quantity > 0),
  unit_type unit_type_enum NOT NULL,
  
  unit_price_usd NUMERIC(15,2) NOT NULL,
  unit_price_ves NUMERIC(15,2) NOT NULL,
  
  total_usd NUMERIC(15,2) NOT NULL,
  total_ves NUMERIC(15,2) NOT NULL,
  
  iva_rate NUMERIC(3,2) NOT NULL DEFAULT 0.16,
  iva_usd NUMERIC(15,2) NOT NULL DEFAULT 0,
  iva_ves NUMERIC(15,2) NOT NULL DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PURCHASE ORDERS
-- ============================================================================

CREATE TABLE purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id),
  
  status purchase_order_status_enum NOT NULL DEFAULT 'draft',
  
  -- Totals
  subtotal_usd NUMERIC(15,2) NOT NULL DEFAULT 0,
  subtotal_ves NUMERIC(15,2) NOT NULL DEFAULT 0,
  iva_usd NUMERIC(15,2) NOT NULL DEFAULT 0,
  iva_ves NUMERIC(15,2) NOT NULL DEFAULT 0,
  total_usd NUMERIC(15,2) NOT NULL DEFAULT 0,
  total_ves NUMERIC(15,2) NOT NULL DEFAULT 0,
  
  expected_date DATE,
  received_at TIMESTAMPTZ,
  
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES pharmacy_users(id)
);

CREATE TABLE purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  
  unit_price_usd NUMERIC(15,2) NOT NULL,
  unit_price_ves NUMERIC(15,2) NOT NULL,
  
  lot_number TEXT,
  expiry_date DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- AUDIT & SECURITY
-- ============================================================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES pharmacy_users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CLINICAL SERVICES
-- ============================================================================

CREATE TABLE adverse_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id),
  product_id UUID NOT NULL REFERENCES products(id),
  
  reaction_type TEXT NOT NULL,
  severity TEXT NOT NULL, -- 'mild', 'moderate', 'severe', 'life_threatening'
  description TEXT,
  
  reported_by UUID REFERENCES pharmacy_users(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- LOYALTY PROGRAMS
-- ============================================================================

CREATE TABLE loyalty_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type loyalty_program_type_enum NOT NULL DEFAULT 'manufacturer',
  description TEXT,
  
  -- Points configuration
  points_per_currency NUMERIC(15,6) NOT NULL, -- Points per USD/VES
  redemption_value NUMERIC(15,6) NOT NULL, -- Currency value per point
  max_redemption_percentage NUMERIC(3,2) NOT NULL DEFAULT 0.50, -- Max 50% of order
  
  -- Eligibility
  eligible_categories TEXT[] DEFAULT '{}',
  eligible_products TEXT[] DEFAULT '{}',
  requires_prescription BOOLEAN DEFAULT false,
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE loyalty_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id),
  program_id UUID NOT NULL REFERENCES loyalty_programs(id),
  
  balance INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT loyalty_points_patient_program_unique UNIQUE (patient_id, program_id)
);

CREATE TABLE loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id),
  program_id UUID NOT NULL REFERENCES loyalty_programs(id),
  invoice_id UUID REFERENCES invoices(id),
  
  transaction_type TEXT NOT NULL, -- 'earned', 'redeemed'
  points INTEGER NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SERVICES & SPECIAL ORDERS
-- ============================================================================

CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  
  price_usd NUMERIC(15,2) NOT NULL DEFAULT 0,
  price_ves NUMERIC(15,2) NOT NULL DEFAULT 0,
  
  duration_minutes INTEGER,
  requires_appointment BOOLEAN DEFAULT false,
  requires_prescription BOOLEAN DEFAULT false,
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE special_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  patient_id UUID NOT NULL REFERENCES patients(id),
  product_id UUID NOT NULL REFERENCES products(id),
  
  quantity INTEGER NOT NULL,
  
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'ordered', 'received', 'completed'
  
  -- Pricing
  advance_payment_percentage NUMERIC(3,2) NOT NULL DEFAULT 0.50,
  subtotal_usd NUMERIC(15,2) NOT NULL DEFAULT 0,
  subtotal_ves NUMERIC(15,2) NOT NULL DEFAULT 0,
  advance_payment_usd NUMERIC(15,2) NOT NULL DEFAULT 0,
  advance_payment_ves NUMERIC(15,2) NOT NULL DEFAULT 0,
  remaining_balance_usd NUMERIC(15,2) NOT NULL DEFAULT 0,
  remaining_balance_ves NUMERIC(15,2) NOT NULL DEFAULT 0,
  
  estimated_delivery_date DATE,
  actual_delivery_date DATE,
  
  payment_method payment_method_enum NOT NULL,
  
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES pharmacy_users(id)
);

-- ============================================================================
-- DELIVERY
-- ============================================================================

CREATE TABLE delivery_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  
  base_fee_usd NUMERIC(15,2) NOT NULL DEFAULT 0,
  base_fee_ves NUMERIC(15,2) NOT NULL DEFAULT 0,
  fee_per_km_usd NUMERIC(15,2) NOT NULL DEFAULT 0,
  fee_per_km_ves NUMERIC(15,2) NOT NULL DEFAULT 0,
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE delivery_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  invoice_id UUID NOT NULL REFERENCES invoices(id),
  
  delivery_zone_id UUID NOT NULL REFERENCES delivery_zones(id),
  
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'
  
  -- Delivery fee
  delivery_fee_usd NUMERIC(15,2) NOT NULL DEFAULT 0,
  delivery_fee_ves NUMERIC(15,2) NOT NULL DEFAULT 0,
  
  -- Delivery person
  delivery_person_name TEXT,
  delivery_person_phone TEXT,
  
  -- Tracking
  estimated_delivery_time TIMESTAMPTZ,
  actual_delivery_time TIMESTAMPTZ,
  
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PETTY CASH
-- ============================================================================

CREATE TABLE petty_cash_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id),
  
  balance_usd NUMERIC(15,2) NOT NULL DEFAULT 0,
  balance_ves NUMERIC(15,2) NOT NULL DEFAULT 0,
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE petty_cash_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES petty_cash_accounts(id),
  
  transaction_type TEXT NOT NULL, -- 'deposit', 'withdrawal', 'replenishment'
  amount_usd NUMERIC(15,2) NOT NULL,
  amount_ves NUMERIC(15,2) NOT NULL,
  
  category TEXT,
  description TEXT,
  receipt_number TEXT,
  
  approved_by UUID REFERENCES pharmacy_users(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

CREATE TABLE sms_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'order_confirmation', 'delivery_update', 'appointment', 'loyalty_points'
  template TEXT NOT NULL,
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sms_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES sms_templates(id),
  
  phone_number TEXT NOT NULL,
  message TEXT NOT NULL,
  
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed'
  
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- COMMERCIAL STRATEGIES
-- ============================================================================

CREATE TABLE discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  
  discount_type TEXT NOT NULL, -- 'percentage', 'fixed_amount'
  value NUMERIC(15,2) NOT NULL,
  
  -- Applicability
  applicable_to TEXT NOT NULL, -- 'product', 'category', 'brand', 'order', 'customer', 'warehouse'
  applicable_ids TEXT[] DEFAULT '{}',
  
  -- Time-based
  start_date DATE,
  end_date DATE,
  days_of_week TEXT[] DEFAULT '{}',
  start_time TIME,
  end_time TIME,
  
  -- Volume-based
  min_quantity INTEGER,
  max_quantity INTEGER,
  
  -- Limits
  max_discount_percentage NUMERIC(3,2),
  max_discount_amount_usd NUMERIC(15,2),
  max_discount_amount_ves NUMERIC(15,2),
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE combos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  
  discount_percentage NUMERIC(3,2) NOT NULL,
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE combo_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  combo_id UUID NOT NULL REFERENCES combos(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CONSULTATIONS
-- ============================================================================

CREATE TABLE consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id),
  pharmacist_id UUID NOT NULL REFERENCES pharmacy_users(id),
  
  vital_signs JSONB,
  diagnosis TEXT,
  treatment TEXT,
  
  consultation_fee_usd NUMERIC(15,2) NOT NULL DEFAULT 0,
  consultation_fee_ves NUMERIC(15,2) NOT NULL DEFAULT 0,
  
  follow_up_date DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CONSIGNMENTS
-- ============================================================================

CREATE TABLE consignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id),
  
  agreement_date DATE NOT NULL,
  payment_terms TEXT NOT NULL,
  commission_percentage NUMERIC(3,2) NOT NULL,
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE consignment_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consignment_id UUID NOT NULL REFERENCES consignments(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  
  quantity_sold INTEGER NOT NULL DEFAULT 0,
  quantity_returned INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Products
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_category ON products(category);

-- Batches
CREATE INDEX idx_batches_product ON batches(product_id);
CREATE INDEX idx_batches_warehouse ON batches(warehouse_id);
CREATE INDEX idx_batches_expiry ON batches(expiry_date);
CREATE INDEX idx_batches_lot ON batches(lot_number);

-- Invoices
CREATE INDEX idx_invoices_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_patient ON invoices(patient_id);
CREATE INDEX idx_invoices_warehouse ON invoices(warehouse_id);
CREATE INDEX idx_invoices_user ON invoices(user_id);
CREATE INDEX idx_invoices_date ON invoices(created_at);

-- Invoice Items
CREATE INDEX idx_invoice_items_invoice ON invoice_items(invoice_id);
CREATE INDEX idx_invoice_items_product ON invoice_items(product_id);

-- Purchase Orders
CREATE INDEX idx_purchase_orders_number ON purchase_orders(order_number);
CREATE INDEX idx_purchase_orders_supplier ON purchase_orders(supplier_id);
CREATE INDEX idx_purchase_orders_warehouse ON purchase_orders(warehouse_id);

-- Audit Logs
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_date ON audit_logs(created_at);

-- Patients
CREATE INDEX idx_patients_ci ON patients(ci);
CREATE INDEX idx_patients_name ON patients(first_name, last_name);

-- Loyalty
CREATE INDEX idx_loyalty_points_patient ON loyalty_points(patient_id);
CREATE INDEX idx_loyalty_transactions_patient ON loyalty_transactions(patient_id);

-- ============================================================================
-- TRIGGERS & FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER update_pharmacy_users_updated_at BEFORE UPDATE ON pharmacy_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_warehouses_updated_at BEFORE UPDATE ON warehouses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_batches_updated_at BEFORE UPDATE ON batches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON purchase_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loyalty_programs_updated_at BEFORE UPDATE ON loyalty_programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loyalty_points_updated_at BEFORE UPDATE ON loyalty_points
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_special_orders_updated_at BEFORE UPDATE ON special_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_delivery_zones_updated_at BEFORE UPDATE ON delivery_zones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_delivery_orders_updated_at BEFORE UPDATE ON delivery_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_petty_cash_accounts_updated_at BEFORE UPDATE ON petty_cash_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sms_templates_updated_at BEFORE UPDATE ON sms_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discounts_updated_at BEFORE UPDATE ON discounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_combos_updated_at BEFORE UPDATE ON combos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consultations_updated_at BEFORE UPDATE ON consultations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consignments_updated_at BEFORE UPDATE ON consignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consignment_items_updated_at BEFORE UPDATE ON consignment_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE pharmacy_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE adverse_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

-- Users can see their own data
CREATE POLICY "Users can view own data" ON pharmacy_users
  FOR SELECT USING ((select auth.uid()) = id);

-- Admins can view all data
CREATE POLICY "Admins can view all users" ON pharmacy_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pharmacy_users WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

-- Patients can view their own data
CREATE POLICY "Patients can view own data" ON patients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patients WHERE id = (select auth.uid())
    )
  );

-- Users can view invoices from their warehouse
CREATE POLICY "Users can view warehouse invoices" ON invoices
  FOR SELECT USING (
    warehouse_id IN (
      SELECT warehouse_id FROM pharmacy_users WHERE id = (select auth.uid())
    )
  );

-- Audit logs are read-only for admins
CREATE POLICY "Admins can view audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pharmacy_users WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE pharmacy_users IS 'Pharmacy system users with roles';
COMMENT ON TABLE warehouses IS 'Storage locations for inventory';
COMMENT ON TABLE suppliers IS 'Product suppliers and vendors';
COMMENT ON TABLE products IS 'Product catalog with pricing and inventory settings';
COMMENT ON TABLE batches IS 'Batch/lot tracking for FEFO inventory management';
COMMENT ON TABLE patients IS 'Patient/customer records';
COMMENT ON TABLE invoices IS 'Sales invoices and transactions';
COMMENT ON TABLE invoice_items IS 'Line items for invoices';
COMMENT ON TABLE purchase_orders IS 'Purchase orders from suppliers';
COMMENT ON TABLE purchase_order_items IS 'Items in purchase orders';
COMMENT ON TABLE audit_logs IS 'Audit trail for all system actions';
COMMENT ON TABLE adverse_reactions IS 'Patient adverse reaction reports';
COMMENT ON TABLE loyalty_programs IS 'Loyalty and rewards programs';
COMMENT ON TABLE loyalty_points IS 'Patient loyalty point balances';
COMMENT ON TABLE loyalty_transactions IS 'Loyalty point transactions';
COMMENT ON TABLE services IS 'Service catalog (TAE, lab tests, etc.)';
COMMENT ON TABLE special_orders IS 'Special orders with advance payment';
COMMENT ON TABLE delivery_zones IS 'Delivery zones with pricing';
COMMENT ON TABLE delivery_orders IS 'Home delivery orders';
COMMENT ON TABLE petty_cash_accounts IS 'Petty cash accounts for minor expenses';
COMMENT ON TABLE petty_cash_transactions IS 'Petty cash transaction records';
COMMENT ON TABLE sms_templates IS 'SMS notification templates';
COMMENT ON TABLE sms_messages IS 'Sent SMS messages';
COMMENT ON TABLE discounts IS 'Discount and promotion rules';
COMMENT ON TABLE combos IS 'Product combo packages';
COMMENT ON TABLE consultations IS 'Pharmacist consultation records';
COMMENT ON TABLE consignments IS 'Consignment agreements with suppliers';
COMMENT ON TABLE consignment_items IS 'Items on consignment';
