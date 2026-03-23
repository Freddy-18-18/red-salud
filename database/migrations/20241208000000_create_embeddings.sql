-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create a table to store your documents
create table if not exists documents (
  id bigserial primary key,
  content text, -- The text content of the document
  metadata jsonb, -- Additional metadata (e.g., source URL, title)
  embedding vector(768) -- Google Gemini embedding dimension is 768 for text-embedding-004
);

-- Create a function to search for documents
create or replace function match_documents (
  query_embedding vector(768),
  match_threshold float,
  match_count int
) returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
) language plpgsql stable as $$
begin
  return query
  select
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where 1 - (documents.embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
end;
$$;

-- Create an index for faster similarity search (optional for small datasets, recommended for production)
create index on documents using ivfflat (embedding vector_cosine_ops)
with (lists = 100);
