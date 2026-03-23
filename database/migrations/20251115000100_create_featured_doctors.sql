-- Tabla de médicos destacados para controlar qué perfiles aparecen en la Home
-- Requiere extensión pgcrypto para gen_random_uuid() si no existe
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;

create table if not exists public.featured_doctors (
  id uuid primary key default gen_random_uuid(),
  doctor_profile_id uuid not null references public.doctor_profiles(id) on delete cascade,
  rank int not null default 100,
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default now()
);

-- Índices útiles
create index if not exists featured_doctors_doctor_profile_id_idx on public.featured_doctors(doctor_profile_id);
create index if not exists featured_doctors_rank_idx on public.featured_doctors(rank);

-- Seguridad
alter table public.featured_doctors enable row level security;
-- Sin políticas para clientes: solo el Service Role (admin) usará esta tabla desde la API.
-- Agregar políticas futuras para panel admin si se requiere edición desde UI.
