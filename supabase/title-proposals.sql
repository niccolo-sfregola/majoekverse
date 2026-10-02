-- ============================================================
-- Fase 8 — Proposte di titolo del vincitore della parola della settimana.
-- Da eseguire una volta nel SQL Editor di Supabase.
-- ============================================================

create table if not exists public.title_proposals (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users (id) on delete cascade,
  -- La settimana VINTA (il suo lunedì), non quella in cui si propone.
  settimana   date not null,
  -- 140 caratteri = limite dei titoli su Twitch.
  titolo      text not null check (char_length(titolo) between 1 and 140),
  stato       text not null default 'pending'
              check (stato in ('pending', 'accepted', 'rejected')),
  -- Motivo del rifiuto (facoltativo), lo vede il vincitore.
  motivo      text,
  username    text not null,
  created_at  timestamptz not null default now(),
  reviewed_at timestamptz
);

-- Al massimo UNA proposta in attesa e UNA accettata per vincitore e
-- settimana: lo garantisce il database anche se arrivano due richieste insieme.
create unique index if not exists title_proposals_one_pending
  on public.title_proposals (user_id, settimana) where stato = 'pending';
create unique index if not exists title_proposals_one_accepted
  on public.title_proposals (user_id, settimana) where stato = 'accepted';

alter table public.title_proposals enable row level security;

-- Nessuna policy: le proposte le vedono solo il vincitore (dalla sua pagina)
-- e gli admin, sempre passando dal server con la chiave service_role.

-- Permessi per il server: su questo progetto le tabelle nuove non li danno
-- in automatico a service_role.
grant select, insert, update, delete on table public.title_proposals to service_role;
