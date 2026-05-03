-- Move the `unaccent` extension out of the `public` schema. All other
-- extensions (pg_trgm, moddatetime, vector, pgcrypto, uuid-ossp,
-- pg_stat_statements) already live under `extensions`. `unaccent` was the
-- only outlier, flagged by the Supabase advisor `extension_in_public` (WARN).
ALTER EXTENSION unaccent SET SCHEMA extensions;
