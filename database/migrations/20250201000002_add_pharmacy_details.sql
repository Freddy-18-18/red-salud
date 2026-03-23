-- ============================================================================
-- PHARMACY DETAILS & REGISTRATION UPDATES
-- ============================================================================

-- Create pharmacy_details table if it doesn't exist
CREATE TABLE IF NOT EXISTS pharmacy_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rif TEXT UNIQUE NOT NULL,
  business_name TEXT NOT NULL,
  
  -- Registration Data
  mercantile_register_number TEXT,
  mercantile_register_doc_url TEXT,
  
  sanitary_license_number TEXT,
  sanitary_license_doc_url TEXT,
  
  zoning_permit_doc_url TEXT,
  
  -- Geolocation
  address TEXT,
  city TEXT,
  state TEXT,
  coordinates JSONB, -- { lat: number, lng: number }
  
  -- Legal Representative
  legal_representative_name TEXT,
  legal_representative_ci TEXT,
  legal_representative_phone TEXT,
  legal_representative_email TEXT,
  
  -- Status
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure pharmacy_users references pharmacy_details correctly
-- Note: This is a destructive change if data exists, but since we are in a dev setup 
-- and fixing the schema dependencies noticed earlier, we will ensure the column exists.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pharmacy_users' AND column_name = 'pharmacy_id'
  ) THEN
    ALTER TABLE pharmacy_users ADD COLUMN pharmacy_id UUID REFERENCES pharmacy_details(id);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE pharmacy_details ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public can insert for registration" ON pharmacy_details
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Pharmacy users can view their own details" ON pharmacy_details
  FOR SELECT USING (
    id IN (SELECT pharmacy_id FROM pharmacy_users WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM pharmacy_users WHERE id = auth.uid() AND role = 'admin')
  );

-- Trigger for updated_at
CREATE TRIGGER update_pharmacy_details_updated_at 
  BEFORE UPDATE ON pharmacy_details
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
