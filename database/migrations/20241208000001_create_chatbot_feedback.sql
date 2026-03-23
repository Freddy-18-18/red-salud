-- Create a table to store chatbot feedback
CREATE TABLE IF NOT EXISTS chatbot_feedback (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  message_content text NOT NULL,
  response_content text NOT NULL,
  is_positive boolean NOT NULL,
  feedback_text text, -- Optional written feedback
  session_id text, -- To group messages from same session
  page_url text, -- URL where the chat happened
  created_at timestamptz DEFAULT now()
);

-- Create index for analytics
CREATE INDEX IF NOT EXISTS idx_chatbot_feedback_created_at ON chatbot_feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_chatbot_feedback_is_positive ON chatbot_feedback(is_positive);

-- Enable RLS
ALTER TABLE chatbot_feedback ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert feedback (anonymous)
CREATE POLICY "Allow anonymous feedback insert" ON chatbot_feedback
  FOR INSERT WITH CHECK (true);

-- Only authenticated admins can read feedback
CREATE POLICY "Allow admins to read feedback" ON chatbot_feedback
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Add a created_at column to documents if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'documents' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE documents ADD COLUMN created_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Add a category column to documents for filtering
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'documents' AND column_name = 'category'
  ) THEN
    ALTER TABLE documents ADD COLUMN category text;
  END IF;
END $$;

-- Create index for category
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
