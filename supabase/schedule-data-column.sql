-- ============================================================
-- Schedule: sostituisce "giorno" (testo tipo "Mar") con "data" (data vera).
-- Il nome del giorno ("Martedì" / "Tuesday") e il formato 11/08 vengono
-- calcolati dall'app a partire dalla data.
-- Da eseguire una volta nel SQL Editor di Supabase.
-- ============================================================

alter table public.schedule add column if not exists data date;
alter table public.schedule drop column if exists giorno;

-- Le righe di prova vecchie non hanno una data: eliminale e re-inseriscile
-- da /admin con il nuovo campo.
--   delete from public.schedule where data is null;
