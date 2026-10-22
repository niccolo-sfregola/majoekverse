-- ============================================================
-- Parola del giorno: da una riga a settimana a UNA RIGA AL GIORNO.
-- Il vincitore resta settimanale, ma si decide sommando i punti dei 7 giorni.
-- Da eseguire una volta nel SQL Editor di Supabase (dopo wordle-games.sql).
-- ============================================================

-- 1. Il giorno della partita (ora italiana), es. 2026-10-22.
alter table public.wordle_games add column if not exists giorno date;

-- Le partite "settimanali" già giocate contano come partite del loro lunedì:
-- così i punti di questa settimana non vanno persi nel passaggio.
update public.wordle_games set giorno = settimana where giorno is null;

alter table public.wordle_games alter column giorno set not null;

-- 2. Prima: una partita a settimana. Ora: una partita al giorno.
--    `settimana` resta (è il lunedì del giorno): serve a sommare i punti.
alter table public.wordle_games
  drop constraint if exists wordle_games_user_id_settimana_key;
alter table public.wordle_games
  drop constraint if exists wordle_games_user_id_giorno_key;
alter table public.wordle_games
  add constraint wordle_games_user_id_giorno_key unique (user_id, giorno);

-- 3. Indici: classifica del giorno e somma dei punti della settimana.
drop index if exists public.wordle_games_classifica;
create index if not exists wordle_games_giorno
  on public.wordle_games (giorno, solved, attempts, time_ms);
create index if not exists wordle_games_settimana
  on public.wordle_games (settimana, solved);
