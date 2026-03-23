-- =========================================
-- TABLA: customer_deliveries (Entregas a Domicilio)
-- =========================================

CREATE TABLE IF NOT EXISTS customer_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id UUID NOT NULL REFERENCES pharmacy_details(id),
  invoice_id UUID REFERENCES invoices(id),
  
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  delivery_address TEXT NOT NULL,
  city TEXT,
  delivery_notes TEXT,
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_transit', 'delivered', 'failed', 'cancelled')),
  
  delivery_person_name TEXT,
  delivery_person_phone TEXT,
  
  estimated_delivery_time TIMESTAMP WITH TIME ZONE,
  actual_delivery_time TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices
CREATE INDEX idx_customer_deliveries_pharmacy_id ON customer_deliveries(pharmacy_id);
CREATE INDEX idx_customer_deliveries_status ON customer_deliveries(status);
CREATE INDEX idx_customer_deliveries_invoice_id ON customer_deliveries(invoice_id);

-- RLS
ALTER TABLE customer_deliveries ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Users can view deliveries from their pharmacy"
  ON customer_deliveries FOR SELECT
  USING (pharmacy_id IN (
    SELECT pharmacy_id FROM pharmacy_users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert deliveries for their pharmacy"
  ON customer_deliveries FOR INSERT
  WITH CHECK (pharmacy_id IN (
    SELECT pharmacy_id FROM pharmacy_users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update deliveries from their pharmacy"
  ON customer_deliveries FOR UPDATE
  USING (pharmacy_id IN (
    SELECT pharmacy_id FROM pharmacy_users WHERE id = auth.uid()
  ));

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customer_deliveries_updated_at
    BEFORE UPDATE ON customer_deliveries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
