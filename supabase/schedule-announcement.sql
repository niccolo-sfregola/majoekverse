-- ============================================================
-- Fase 5 (estensione) — memoria dell'ultima schedule annunciata su Discord.
-- Serve per calcolare il "diff" quando si annunciano solo le modifiche.
-- Da eseguire una volta nel SQL Editor di Supabase.
-- ============================================================

-- Tabella con una sola riga (id sempre = 1).
create table if not exists public.schedule_announcement (
  id           int primary key default 1,
  snapshot     jsonb not null default '[]'::jsonb,
  announced_at timestamptz,
  constraint schedule_announcement_singleton check (id = 1)
);

alter table public.schedule_announcement enable row level security;

-- Solo gli admin possono leggerla/scriverla.
drop policy if exists "admin all" on public.schedule_announcement;
create policy "admin all" on public.schedule_announcement
  for all using (public.is_admin()) with check (public.is_admin());

-- Crea la riga vuota se non c'è.
insert into public.schedule_announcement (id) values (1)
  on conflict (id) do nothing;
