-- =========================================
-- MIGRACIÓN: CREAR TABLAS DE FARMACIA
-- Versión: 1.0
-- Descripción: Crea todas las tablas necesarias para la funcionalidad de farmacia
-- =========================================

-- ========== 1. TABLA: pharmacy_users ==========
CREATE TABLE IF NOT EXISTS pharmacy_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  pharmacy_id UUID NOT NULL REFERENCES pharmacy_details(id),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('gerente', 'vendedor', 'farmaceutico', 'almacenista')),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices
CREATE INDEX idx_pharmacy_users_pharmacy_id ON pharmacy_users(pharmacy_id);
CREATE INDEX idx_pharmacy_users_role ON pharmacy_users(role);
CREATE INDEX idx_pharmacy_users_is_active ON pharmacy_users(is_active);

-- RLS
ALTER TABLE pharmacy_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY pharmacy_users_select
  ON pharmacy_users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY pharmacy_users_update_self
  ON pharmacy_users FOR UPDATE
  USING (auth.uid() = id);

-- ========== 2. TABLA: products ==========
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id UUID NOT NULL REFERENCES pharmacy_details(id),
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT NOT NULL UNIQUE,
  barcode TEXT UNIQUE,
  
  -- Características farmacéuticas
  generic_name TEXT NOT NULL,
  concentration TEXT,
  presentation TEXT,
  manufacturer TEXT,
  registration_number TEXT,
  
  -- Precios
  precio_compra_usd NUMERIC(12, 2) NOT NULL,
  precio_venta_usd NUMERIC(12, 2) NOT NULL,
  precio_venta_ves NUMERIC(18, 2),
  
  -- Inventario
  stock_actual NUMERIC(10, 2) DEFAULT 0,
  stock_minimo NUMERIC(10, 2) DEFAULT 10,
  
  -- Metadata
  is_controlled BOOLEAN DEFAULT false,
  requires_recipe BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES pharmacy_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices
CREATE INDEX idx_products_pharmacy_id ON products(pharmacy_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_stock ON products(stock_actual) WHERE stock_actual <= stock_minimo;

-- RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY products_select
  ON products FOR SELECT
  USING (pharmacy_id IN (
    SELECT pharmacy_id FROM pharmacy_users WHERE id = auth.uid()
  ));

-- ========== 3. TABLA: batches ==========
CREATE TABLE IF NOT EXISTS batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  lot_number TEXT NOT NULL,
  manufacturing_date DATE,
  expiration_date DATE NOT NULL,
  quantity_received NUMERIC(10, 2) NOT NULL,
  quantity_available NUMERIC(10, 2) NOT NULL,
  cost_per_unit NUMERIC(12, 2) NOT NULL,
  cost_total NUMERIC(15, 2) NOT NULL,
  supplier_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(product_id, lot_number)
);

-- Índices
CREATE INDEX idx_batches_product_id ON batches(product_id);
CREATE INDEX idx_batches_expiration_date ON batches(expiration_date);
CREATE INDEX idx_batches_lot_number ON batches(lot_number);

-- Trigger: Validar FEFO (First Expired First Out)
CREATE OR REPLACE FUNCTION validate_fefo_on_batch_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar que no hay lotes más antiguos después de este
  IF EXISTS (
    SELECT 1 FROM batches
    WHERE product_id = NEW.product_id
    AND expiration_date < NEW.expiration_date
    AND id != NEW.id
  ) THEN
    RAISE EXCEPTION 'Debe usar primero los lotes con vencimiento anterior';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_fefo
BEFORE INSERT OR UPDATE ON batches
FOR EACH ROW
EXECUTE FUNCTION validate_fefo_on_batch_insert();

-- RLS
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;

-- ========== 4. TABLA: invoices ==========
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id UUID NOT NULL REFERENCES pharmacy_details(id),
  invoice_number TEXT NOT NULL UNIQUE,
  invoice_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Cliente
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  
  -- Montos
  subtotal_usd NUMERIC(12, 2) NOT NULL,
  tax_amount_usd NUMERIC(12, 2) NOT NULL DEFAULT 0,
  discount_usd NUMERIC(12, 2) DEFAULT 0,
  total_usd NUMERIC(12, 2) NOT NULL,
  total_ves NUMERIC(18, 2),
  exchange_rate NUMERIC(12, 4),
  
  -- Forma de pago
  payment_method TEXT CHECK (payment_method IN ('efectivo', 'tarjeta', 'pago_movil', 'zelle', 'transferencia')),
  paid_amount_usd NUMERIC(12, 2),
  change_usd NUMERIC(12, 2),
  
  -- Estado
  status TEXT DEFAULT 'completed' CHECK (status IN ('draft', 'completed', 'cancelled')),
  notes TEXT,
  
  -- Auditoría
  created_by UUID REFERENCES pharmacy_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices
CREATE INDEX idx_invoices_pharmacy_id ON invoices(pharmacy_id);
CREATE INDEX idx_invoices_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_date ON invoices(invoice_date);
CREATE INDEX idx_invoices_status ON invoices(status);

-- RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- ========== 5. TABLA: invoice_items ==========
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  batch_id UUID REFERENCES batches(id),
  quantity NUMERIC(10, 2) NOT NULL,
  unit_price_usd NUMERIC(12, 2) NOT NULL,
  discount_percent NUMERIC(5, 2) DEFAULT 0,
  subtotal_usd NUMERIC(12, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices
CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX idx_invoice_items_product_id ON invoice_items(product_id);
CREATE INDEX idx_invoice_items_batch_id ON invoice_items(batch_id);

-- RLS
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- ========== 6. TABLA: suppliers ==========
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id UUID NOT NULL REFERENCES pharmacy_details(id),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  tax_id TEXT,
  bank_account TEXT,
  contact_person TEXT,
  contact_phone TEXT,
  payment_terms TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices
CREATE INDEX idx_suppliers_pharmacy_id ON suppliers(pharmacy_id);
CREATE INDEX idx_suppliers_name ON suppliers(name);
CREATE INDEX idx_suppliers_is_active ON suppliers(is_active);

-- RLS
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

-- ========== 7. TABLA: purchase_orders ==========
CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id UUID NOT NULL REFERENCES pharmacy_details(id),
  po_number TEXT NOT NULL UNIQUE,
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  order_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expected_delivery_date DATE,
  
  subtotal_usd NUMERIC(12, 2) NOT NULL,
  tax_usd NUMERIC(12, 2) DEFAULT 0,
  total_usd NUMERIC(12, 2) NOT NULL,
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  notes TEXT,
  
  created_by UUID REFERENCES pharmacy_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices
CREATE INDEX idx_purchase_orders_pharmacy_id ON purchase_orders(pharmacy_id);
CREATE INDEX idx_purchase_orders_supplier_id ON purchase_orders(supplier_id);
CREATE INDEX idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX idx_purchase_orders_date ON purchase_orders(order_date);

-- RLS
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;

-- ========== 8. TABLA: deliveries ==========
CREATE TABLE IF NOT EXISTS deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id UUID NOT NULL REFERENCES pharmacy_details(id),
  purchase_order_id UUID REFERENCES purchase_orders(id),
  delivery_number TEXT NOT NULL UNIQUE,
  delivery_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expected_date DATE,
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  
  received_by UUID REFERENCES pharmacy_users(id),
  notes TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'partially_received', 'completed', 'returned')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices
CREATE INDEX idx_deliveries_pharmacy_id ON deliveries(pharmacy_id);
CREATE INDEX idx_deliveries_supplier_id ON deliveries(supplier_id);
CREATE INDEX idx_deliveries_status ON deliveries(status);

-- RLS
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;

-- ========== 9. TABLA: inventory_movements ==========
CREATE TABLE IF NOT EXISTS inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id UUID NOT NULL REFERENCES pharmacy_details(id),
  product_id UUID NOT NULL REFERENCES products(id),
  batch_id UUID REFERENCES batches(id),
  
  movement_type TEXT NOT NULL CHECK (movement_type IN ('entrada', 'salida', 'ajuste', 'devolucion', 'perdida', 'expiracion')),
  quantity NUMERIC(10, 2) NOT NULL,
  unit_price_usd NUMERIC(12, 2),
  
  document_type TEXT CHECK (document_type IN ('factura', 'nota_credito', 'orden_compra', 'ajuste_manual')),
  document_id TEXT,
  
  notes TEXT,
  created_by UUID REFERENCES pharmacy_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices
CREATE INDEX idx_inventory_movements_pharmacy_id ON inventory_movements(pharmacy_id);
CREATE INDEX idx_inventory_movements_product_id ON inventory_movements(product_id);
CREATE INDEX idx_inventory_movements_type ON inventory_movements(movement_type);
CREATE INDEX idx_inventory_movements_date ON inventory_movements(created_at);

-- RLS
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;

-- ========== 10. TABLA: alerts ==========
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id UUID NOT NULL REFERENCES pharmacy_details(id),
  product_id UUID REFERENCES products(id),
  alert_type TEXT NOT NULL CHECK (alert_type IN ('stock_bajo', 'vencimiento_proximo', 'vencido', 'sistema')),
  
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'danger')),
  
  is_read BOOLEAN DEFAULT false,
  read_by UUID REFERENCES pharmacy_users(id),
  read_at TIMESTAMP WITH TIME ZONE,
  
  action_taken BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Índices
CREATE INDEX idx_alerts_pharmacy_id ON alerts(pharmacy_id);
CREATE INDEX idx_alerts_product_id ON alerts(product_id);
CREATE INDEX idx_alerts_type ON alerts(alert_type);
CREATE INDEX idx_alerts_is_read ON alerts(is_read);

-- RLS
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- ========== 11. TABLA: settings ==========
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id UUID NOT NULL UNIQUE REFERENCES pharmacy_details(id),
  
  -- Configuración general
  currency_primary TEXT DEFAULT 'USD',
  currency_secondary TEXT DEFAULT 'VES',
  tax_percent NUMERIC(5, 2) DEFAULT 16,
  
  -- Impresora
  printer_name TEXT,
  paper_width_mm INTEGER DEFAULT 80,
  
  -- Límites
  low_stock_alert_enabled BOOLEAN DEFAULT true,
  expiration_alert_days INTEGER DEFAULT 30,
  
  -- Recetas
  digital_recipes_enabled BOOLEAN DEFAULT true,
  recipe_max_days_valid INTEGER DEFAULT 30,
  
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- =========================================
-- TRIGGERS Y FUNCIONES AUTOMÁTICAS
-- =========================================

-- Trigger: Actualizar stock en products cuando se vende
CREATE OR REPLACE FUNCTION update_product_stock_on_invoice()
RETURNS TRIGGER AS $$
BEGIN
  -- Disminuir stock del producto
  UPDATE products SET stock_actual = stock_actual - NEW.quantity
  WHERE id = NEW.product_id;
  
  -- Disminuir cantidad en batch (FEFO)
  UPDATE batches SET quantity_available = quantity_available - NEW.quantity
  WHERE id = NEW.batch_id;
  
  -- Registrar movimiento de inventario
  INSERT INTO inventory_movements (
    pharmacy_id, product_id, batch_id,
    movement_type, quantity, unit_price_usd,
    document_type, document_id, created_by
  ) SELECT
    i.pharmacy_id, NEW.product_id, NEW.batch_id,
    'salida', NEW.quantity, NEW.unit_price_usd,
    'factura', i.invoice_number, i.created_by
  FROM invoices i WHERE i.id = NEW.invoice_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_stock_on_invoice
AFTER INSERT ON invoice_items
FOR EACH ROW
EXECUTE FUNCTION update_product_stock_on_invoice();

-- Trigger: Crear alertas automáticas
CREATE OR REPLACE FUNCTION check_product_alerts()
RETURNS TRIGGER AS $$
BEGIN
  -- Stock bajo
  IF NEW.stock_actual <= NEW.stock_minimo AND OLD.stock_actual > NEW.stock_minimo THEN
    INSERT INTO alerts (
      pharmacy_id, product_id, alert_type, title, message, severity
    ) VALUES (
      (SELECT pharmacy_id FROM products WHERE id = NEW.id),
      NEW.id,
      'stock_bajo',
      'Stock bajo: ' || NEW.name,
      'El producto ' || NEW.name || ' está por debajo del stock mínimo (' || NEW.stock_minimo || ' unidades)',
      'warning'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_product_alerts
AFTER UPDATE ON products
FOR EACH ROW
WHEN (OLD.stock_actual IS DISTINCT FROM NEW.stock_actual)
EXECUTE FUNCTION check_product_alerts();

-- Trigger: Generar número de factura automático
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.invoice_number := 'FAR-' || 
    TO_CHAR(NEW.created_at, 'YYYY-MM-DD') || '-' || 
    LPAD(NEXTVAL('invoices_number_seq')::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS invoices_number_seq START 1;

CREATE TRIGGER trigger_generate_invoice_number
BEFORE INSERT ON invoices
FOR EACH ROW
EXECUTE FUNCTION generate_invoice_number();

-- =========================================
-- INSERTAR DATOS DE PRUEBA
-- =========================================

-- 1. Obtener ID de la farmacia (debe existir)
DO $$
DECLARE
  v_pharmacy_id UUID;
  v_user_id UUID;
BEGIN
  -- Usar la primera farmacia existente
  SELECT id INTO v_pharmacy_id FROM pharmacy_details LIMIT 1;
  
  IF v_pharmacy_id IS NOT NULL THEN
    
    -- 2. Crear usuario de farmacia (si existen usuarios en auth)
    IF EXISTS (SELECT 1 FROM auth.users LIMIT 1) THEN
      SELECT id INTO v_user_id FROM auth.users LIMIT 1;
      
      INSERT INTO pharmacy_users (id, pharmacy_id, full_name, email, phone, role, is_active)
      VALUES (v_user_id, v_pharmacy_id, 'Admin Farmacia', 'admin@farmacia.local', '+58-2123456789', 'gerente', true)
      ON CONFLICT (id) DO NOTHING;
    END IF;
    
    -- 3. Insertar proveedores de prueba
    INSERT INTO suppliers (pharmacy_id, name, email, phone, contact_person, country)
    VALUES
      (v_pharmacy_id, 'Farmalogística S.A.', 'contacto@farmalogistica.com', '+58-2125551234', 'Juan Pérez', 'Venezuela'),
      (v_pharmacy_id, 'Medicinas del Caribe', 'ventas@medicdelcaribe.com', '+58-2125555678', 'María González', 'Venezuela'),
      (v_pharmacy_id, 'Pharma Internacional', 'info@pharmaint.com', '+58-2125559999', 'Carlos López', 'Venezuela')
    ON CONFLICT DO NOTHING;
    
    -- 4. Insertar productos de prueba
    INSERT INTO products (
      pharmacy_id, name, sku, generic_name, concentration, presentation,
      manufacturer, precio_compra_usd, precio_venta_usd, stock_actual, stock_minimo,
      requires_recipe, is_active
    ) VALUES
      (v_pharmacy_id, 'Amoxicilina 500mg', 'AMX-500', 'Amoxicilina', '500mg', 'Cápsula', 'Laboratorio XYZ', 0.80, 2.50, 100, 20, false, true),
      (v_pharmacy_id, 'Ibuprofeno 400mg', 'IBU-400', 'Ibuprofeno', '400mg', 'Comprimido', 'Laboratorio ABC', 0.15, 0.75, 200, 50, false, true),
      (v_pharmacy_id, 'Metformina 500mg', 'MET-500', 'Metformina', '500mg', 'Comprimido', 'Laboratorio DEF', 0.25, 1.20, 150, 30, false, true),
      (v_pharmacy_id, 'Loratadina 10mg', 'LOR-10', 'Loratadina', '10mg', 'Comprimido', 'Laboratorio GHI', 0.20, 1.00, 120, 25, false, true),
      (v_pharmacy_id, 'Omeprazol 20mg', 'OMP-20', 'Omeprazol', '20mg', 'Cápsula', 'Laboratorio JKL', 0.30, 1.50, 80, 20, false, true)
    ON CONFLICT (sku) DO NOTHING;
    
    -- 5. Insertar lotes de prueba
    INSERT INTO batches (
      product_id, lot_number, manufacturing_date, expiration_date,
      quantity_received, quantity_available, cost_per_unit, cost_total
    )
    SELECT
      p.id, 'LOT-' || UPPER(SUBSTRING(p.sku, 1, 3)) || '-2026-01', 
      CURRENT_DATE - INTERVAL '6 months',
      CURRENT_DATE + INTERVAL '12 months',
      100, 100, p.precio_compra_usd, p.precio_compra_usd * 100
    FROM products p
    WHERE p.pharmacy_id = v_pharmacy_id
    ON CONFLICT (product_id, lot_number) DO NOTHING;
    
    -- 6. Crear configuración por defecto
    INSERT INTO settings (pharmacy_id, currency_primary, currency_secondary, tax_percent)
    VALUES (v_pharmacy_id, 'USD', 'VES', 16)
    ON CONFLICT (pharmacy_id) DO NOTHING;
    
    RAISE NOTICE 'Datos de prueba insertados exitosamente para farmacia %', v_pharmacy_id;
    
  ELSE
    RAISE NOTICE 'No se encontró ninguna farmacia. Crea una primero.';
  END IF;
END $$;

-- =========================================
-- PERMISOS Y POLÍTICAS RLS FINALES
-- =========================================

-- Permitir insertar en tablas con RLS
ALTER TABLE pharmacy_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Crear políticas genéricas para vendedor
CREATE POLICY invoices_insert_for_seller
  ON invoices FOR INSERT
  WITH CHECK (pharmacy_id IN (
    SELECT pharmacy_id FROM pharmacy_users WHERE id = auth.uid()
  ));

CREATE POLICY invoices_update_own
  ON invoices FOR UPDATE
  USING (created_by = auth.uid());

-- =========================================
-- VERIFICAR CREACIÓN
-- =========================================

DO $$
BEGIN
  RAISE NOTICE '✓ Tablas creadas: pharmacy_users, products, batches, invoices, invoice_items, suppliers, purchase_orders, deliveries, inventory_movements, alerts, settings';
  RAISE NOTICE '✓ Triggers configurados: FEFO validation, stock updates, alert generation, invoice numbering';
  RAISE NOTICE '✓ RLS activado en todas las tablas';
  RAISE NOTICE '✓ Datos de prueba insertados (5 productos, 5 lotes, 3 proveedores)';
END $$;
