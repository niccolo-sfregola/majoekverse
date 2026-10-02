-- ============================================================
-- Fase 8 — Parola della settimana: una riga per giocatore a settimana.
-- Da eseguire una volta nel SQL Editor di Supabase.
-- ============================================================

create table if not exists public.wordle_games (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users (id) on delete cascade,
  -- Il lunedì della settimana (ora italiana), es. 2026-09-28.
  settimana   date not null,
  -- Le parole provate, in ordine.
  guesses     text[] not null default '{}',
  solved      boolean not null default false,
  -- Primo tentativo e fine partita (vinta o tentativi finiti): li scrive il server.
  started_at  timestamptz not null,
  finished_at timestamptz,
  -- Per la classifica (solo se solved): tentativi usati e tempo dal primo
  -- tentativo alla soluzione.
  attempts    integer,
  time_ms     integer,
  username    text not null,
  avatar_url  text,
  unique (user_id, settimana)
);

create index if not exists wordle_games_classifica
  on public.wordle_games (settimana, solved, attempts, time_ms);

alter table public.wordle_games enable row level security;

-- NESSUNA policy, nemmeno di lettura: i tentativi di chi ha già indovinato
-- svelerebbero la parola. Legge e scrive solo il server (service_role),
-- che alla classifica passa solo nome, tentativi e tempo.

-- Permessi per il server: su questo progetto le tabelle nuove non li danno
-- in automatico a service_role.
grant select, insert, update, delete on table public.wordle_games to service_role;
