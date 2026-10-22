-- ════════════════════════════════════════════════════════════════
--  Reporta Bache · Ciudad Obregón — esquema de Supabase
--  Pega todo este archivo en Supabase → SQL Editor → Run.
--  Se puede ejecutar más de una vez sin romper nada.
-- ════════════════════════════════════════════════════════════════

-- ── Contador de folios por año (BACHE-2026-001, BACHE-2026-002…) ──
create table if not exists public.folio_counters (
  year        int primary key,
  last_value  int not null default 0
);
alter table public.folio_counters enable row level security;
-- Sin políticas: solo el servidor (service role) puede tocarla.

-- ── Reportes ──────────────────────────────────────────────────────
create table if not exists public.reports (
  id            uuid primary key default gen_random_uuid(),
  folio         text unique not null,
  created_at    timestamptz not null default now(),
  lat           double precision not null check (lat between -90 and 90),
  lng           double precision not null check (lng between -180 and 180),
  address       text check (char_length(address) <= 300),
  urgency       text not null check (urgency in ('muy_urgente', 'urgente', 'no_urgente')),
  comment       text check (char_length(comment) <= 1000),
  photo_url     text,
  photo_path    text,
  status        text not null default 'recibido'
                check (status in ('recibido', 'en_proceso', 'reparado')),
  email_status  text not null default 'pendiente'
                check (email_status in ('pendiente', 'enviado', 'error', 'desactivado', 'sin_configurar'))
);

create index if not exists reports_created_at_idx on public.reports (created_at desc);
create index if not exists reports_urgency_idx on public.reports (urgency);

-- ── Bitácora de envíos (privada: guarda errores técnicos) ─────────
create table if not exists public.report_notifications (
  id          bigint generated always as identity primary key,
  report_id   uuid not null references public.reports(id) on delete cascade,
  channel     text not null,          -- 'resend' | 'smtp'
  status      text not null,          -- 'enviado' | 'error'
  detail      text,
  created_at  timestamptz not null default now()
);
alter table public.report_notifications enable row level security;

-- ── Generación automática del folio ───────────────────────────────
create or replace function public.next_report_folio()
returns text
language plpgsql
set search_path = public
as $$
declare
  y int := extract(year from (now() at time zone 'America/Hermosillo'))::int;
  n int;
begin
  insert into public.folio_counters (year, last_value)
  values (y, 1)
  on conflict (year) do update
    set last_value = public.folio_counters.last_value + 1
  returning last_value into n;

  return 'BACHE-' || y || '-' ||
         case when n < 1000 then lpad(n::text, 3, '0') else n::text end;
end;
$$;

create or replace function public.reports_set_folio()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.folio is null or new.folio = '' then
    new.folio := public.next_report_folio();
  end if;
  return new;
end;
$$;

drop trigger if exists reports_set_folio on public.reports;
create trigger reports_set_folio
  before insert on public.reports
  for each row execute function public.reports_set_folio();

-- ── Seguridad: cualquiera puede VER reportes, nadie puede escribir ──
--    directamente; las altas pasan por el servidor con service role.
alter table public.reports enable row level security;

drop policy if exists "Lectura pública de reportes" on public.reports;
create policy "Lectura pública de reportes"
  on public.reports for select
  to anon, authenticated
  using (true);

-- ── Tiempo real: el mapa ciudadano recibe reportes nuevos al instante ──
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'reports'
  ) then
    alter publication supabase_realtime add table public.reports;
  end if;
end;
$$;

-- ── Almacenamiento de fotos (bucket público, máx. 5 MB, solo imágenes) ──
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos-baches', 'fotos-baches', true, 5242880,
        array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
