-- Token OAuth di Twitch salvati (serve solo per Joe / broadcaster: leggere
-- follower e abbonati). Da lanciare una volta nel SQL editor di Supabase.
--
-- RLS attiva SENZA policy = nessun accesso con anon/authenticated key.
-- Ci si arriva solo con la SERVICE_ROLE key, lato server.

create table if not exists public.twitch_credentials (
  user_id uuid primary key references auth.users (id) on delete cascade,
  access_token text not null,
  refresh_token text,
  expires_at timestamptz,
  scopes text,
  updated_at timestamptz not null default now()
);

alter table public.twitch_credentials enable row level security;
