-- ============================================================
-- Fase 8 — Zip del giorno: una riga per partita.
-- Da eseguire una volta nel SQL Editor di Supabase.
-- ============================================================

create table if not exists public.zip_games (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users (id) on delete cascade,
  -- Il giorno del puzzle (ora italiana), es. 2026-10-01.
  giorno      date not null,
  -- Partenza e arrivo li scrive il server, mai il browser.
  started_at  timestamptz not null,
  finished_at timestamptz,
  -- Tempo finale in millisecondi (null = partita non finita).
  time_ms     integer,
  -- Copia di nome e avatar Twitch al momento della partita: la classifica è
  -- pubblica e auth.users non è leggibile da fuori.
  username    text not null,
  avatar_url  text,
  -- Un solo tentativo al giorno per utente.
  unique (user_id, giorno)
);

-- Per la classifica: "tutte le partite di quel giorno, in ordine di tempo".
create index if not exists zip_games_classifica
  on public.zip_games (giorno, time_ms);

alter table public.zip_games enable row level security;

-- Tutti possono LEGGERE (la classifica è pubblica).
drop policy if exists "public read" on public.zip_games;
create policy "public read" on public.zip_games
  for select using (true);

-- Nessuna policy di INSERT/UPDATE/DELETE: nessun utente può scrivere qui,
-- nemmeno sulla propria riga. Scrive solo il server con la chiave
-- service_role (che ignora la RLS), dopo aver controllato la soluzione.
