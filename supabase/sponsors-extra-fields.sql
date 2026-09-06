-- Sponsor: percentuale di sconto, logo e flag "sponsor ufficiale".
-- Da lanciare una volta nel SQL editor di Supabase.

alter table sponsors
  add column if not exists sconto text,
  add column if not exists logo text,
  add column if not exists ufficiale boolean not null default false;
