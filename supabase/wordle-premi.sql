-- ============================================================
-- Premio della parola: chi ha ricevuto il titolo, settimana per settimana.
-- Serve a saltare chi l'aveva già avuto la settimana prima.
-- Da eseguire una volta nel SQL Editor di Supabase.
-- ============================================================

create table if not exists public.wordle_premi (
  -- Il lunedì della settimana vinta.
  settimana  date primary key,
  -- Chi propone il titolo. null = nessuno (ha vinto Joe, o non c'era
  -- nessun altro in classifica).
  user_id    uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.wordle_premi enable row level security;

-- Nessuna policy: la legge e la scrive solo il server (service_role).
-- Le righe le crea il codice da solo, la prima volta che servono.

-- Permessi per il server: su questo progetto le tabelle nuove non li danno
-- in automatico a service_role.
grant select, insert, update, delete on table public.wordle_premi to service_role;
