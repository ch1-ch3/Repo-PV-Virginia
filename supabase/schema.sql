-- Ejecutar en Supabase > SQL Editor
create table if not exists public.fichas (
  id text primary key,
  creado timestamptz not null default now(),
  nombre text,
  data jsonb not null
);
create index if not exists fichas_creado_idx on public.fichas (creado desc);
-- La API usa la service role key desde el servidor; no se expone al navegador.
alter table public.fichas enable row level security;
