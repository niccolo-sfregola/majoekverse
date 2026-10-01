-- ============================================================
-- Fase 9 — Notifiche push: un'iscrizione per DISPOSITIVO (telefono, PC…).
-- Da eseguire una volta nel SQL Editor di Supabase.
-- ============================================================

create table if not exists public.push_subscriptions (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users (id) on delete cascade,
  -- Indirizzo a cui il servizio push del browser (Google, Apple, Mozilla)
  -- consegna le notifiche per questo dispositivo: è unico.
  endpoint    text not null unique,
  -- Chiavi con cui il server cifra il contenuto della notifica.
  p256dh      text not null,
  auth        text not null,
  -- Preferenze di questo dispositivo.
  notify_zip    boolean not null default true,
  notify_wordle boolean not null default true,
  -- Lingua in cui scrivere le notifiche ("it" / "en").
  lang        text not null default 'it',
  created_at  timestamptz not null default now()
);

create index if not exists push_subscriptions_user
  on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

-- Nessuna policy: legge e scrive solo il server (service_role). Le chiavi
-- di un'iscrizione permettono di mandare notifiche a quel dispositivo.
