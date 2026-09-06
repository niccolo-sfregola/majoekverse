-- Eventi riservati agli abbonati del canale.
-- Da lanciare una volta nel SQL editor di Supabase.

alter table events
  add column if not exists solo_abbonati boolean not null default false;
