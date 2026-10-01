-- ============================================================
-- Fase 9 — Notifiche a orario (Zip, solleciti, parola della settimana).
-- Da eseguire nel SQL Editor di Supabase, in DUE momenti:
--   PARTE 1 → subito (serve anche per le prove in locale).
--   PARTE 2 → DOPO aver messo online l'app con CRON_SECRET su Vercel.
-- ============================================================


-- ---------- PARTE 1: registro degli invii ----------------------------------
-- Una riga per (invio, giorno): se pg_cron ripete una chiamata, la route
-- vede che l'invio di oggi è già stato fatto e non manda doppioni.
create table if not exists public.push_jobs (
  job     text not null,
  giorno  date not null,
  ran_at  timestamptz not null default now(),
  primary key (job, giorno)
);

alter table public.push_jobs enable row level security;
-- Nessuna policy: la usa solo il server (service_role).




-- Utili:
--   select * from cron.job;                                  -- job programmati
--   select * from cron.job_run_details order by start_time desc limit 10;
--   select * from net._http_response order by created desc limit 10; -- risposte
--   select cron.unschedule('majoekverse-notifiche');         -- per toglierlo
