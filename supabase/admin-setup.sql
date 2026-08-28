-- ============================================================
-- Fase 5 — Ruolo admin + permessi di scrittura
-- Da eseguire una volta nel SQL Editor di Supabase.
-- ============================================================

-- 1. Tabella degli utenti autorizzati.
--    Se il tuo user_id è qui dentro, sei admin.
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

-- Ognuno può leggere SOLO la propria riga (serve all'app per sapere
-- "sono admin?"). Nessuno può inserirsi da solo: le righe si aggiungono
-- a mano dal SQL Editor.
drop policy if exists "read own admin row" on public.admins;
create policy "read own admin row" on public.admins
  for select using (auth.uid() = user_id);

-- 2. Funzione helper: true se l'utente corrente è admin.
--    security definer = gira con i permessi del creatore, così può
--    leggere public.admins ignorando la RLS senza loop.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins where user_id = auth.uid()
  );
$$;

-- 3. Permessi di scrittura sulle tabelle di contenuto.
--    La lettura pubblica resta invariata (policy SELECT della Fase 2).
--    Qui aggiungiamo: solo gli admin possono INSERT / UPDATE / DELETE.
do $$
declare
  t text;
begin
  foreach t in array array['schedule', 'news', 'events', 'sponsors']
  loop
    execute format('drop policy if exists "admin insert" on public.%I', t);
    execute format('drop policy if exists "admin update" on public.%I', t);
    execute format('drop policy if exists "admin delete" on public.%I', t);

    execute format(
      'create policy "admin insert" on public.%I for insert with check (public.is_admin())', t);
    execute format(
      'create policy "admin update" on public.%I for update using (public.is_admin()) with check (public.is_admin())', t);
    execute format(
      'create policy "admin delete" on public.%I for delete using (public.is_admin())', t);
  end loop;
end $$;

-- ============================================================
-- Dopo aver eseguito questo script, rendi te stesso admin:
--
--   insert into public.admins (user_id) values ('IL-TUO-USER-UID');
--
-- (l'UID si trova in Authentication -> Users)
-- ============================================================
