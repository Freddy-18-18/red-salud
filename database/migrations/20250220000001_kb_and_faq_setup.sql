-- Enable pgvector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Create documents table for knowledge base indexing
CREATE TABLE IF NOT EXISTS public.documents (
    id BIGSERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    embedding VECTOR(768), -- Adjusted to 768 for Gemini text-embedding-004
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Allow public read access to documents
CREATE POLICY "Allow public read for documents" 
ON public.documents 
FOR SELECT 
TO public 
USING (true);

-- Function for semantic search
CREATE OR REPLACE FUNCTION public.match_documents (
  query_embedding VECTOR(768),
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE (
  id BIGINT,
  content TEXT,
  metadata JSONB,
  category TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    documents.id,
    documents.content,
    documents.metadata,
    documents.category,
    1 - (documents.embedding <=> query_embedding) AS similarity
  FROM documents
  WHERE 1 - (documents.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;
