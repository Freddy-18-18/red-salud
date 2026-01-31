-- Add premium fields to doctor_offices
ALTER TABLE doctor_offices 
ADD COLUMN IF NOT EXISTS amenities JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS price_info JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS arrival_instructions TEXT,
ADD COLUMN IF NOT EXISTS reception_info JSONB DEFAULT '{}'::jsonb;

-- Create office_photos table
CREATE TABLE IF NOT EXISTS office_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    office_id UUID REFERENCES doctor_offices(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    caption TEXT,
    is_cover BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies for office_photos
ALTER TABLE office_photos ENABLE ROW LEVEL SECURITY;

-- Policy: Doctors can view photos of their own offices
CREATE POLICY "Users can view photos of their offices" ON office_photos
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM doctor_offices
            WHERE doctor_offices.id = office_photos.office_id
            AND doctor_offices.doctor_id = auth.uid()
        )
    );

-- Policy: Doctors can insert photos for their own offices
CREATE POLICY "Users can insert photos for their offices" ON office_photos
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM doctor_offices
            WHERE doctor_offices.id = office_photos.office_id
            AND doctor_offices.doctor_id = auth.uid()
        )
    );

-- Policy: Doctors can update photos of their own offices
CREATE POLICY "Users can update photos of their offices" ON office_photos
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM doctor_offices
            WHERE doctor_offices.id = office_photos.office_id
            AND doctor_offices.doctor_id = auth.uid()
        )
    );

-- Policy: Doctors can delete photos of their own offices
CREATE POLICY "Users can delete photos of their offices" ON office_photos
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM doctor_offices
            WHERE doctor_offices.id = office_photos.office_id
            AND doctor_offices.doctor_id = auth.uid()
        )
    );

-- Create storage bucket for office photos if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('office-photos', 'office-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Policy for storage: Public access to read
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'office-photos' );

-- Policy for storage: Authenticated users can upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'office-photos' AND
  auth.role() = 'authenticated'
);

-- Policy for storage: Users can update their own files
CREATE POLICY "Users can update their own files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'office-photos' AND
  auth.uid() = owner
);

-- Policy for storage: Users can delete their own files
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'office-photos' AND
  auth.uid() = owner
);
