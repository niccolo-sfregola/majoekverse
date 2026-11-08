-- 1) Piattaforma di ogni diretta della schedule: Twitch, TikTok o entrambe.
--    È un array di testo, così una riga può averne più di una.
--    Le righe che ci sono già diventano "solo Twitch" (com'era finora).
-- 2) Testo inglese (facoltativo) di news ed eventi: se manca, l'app mostra
--    quello italiano anche a chi ha scelto l'inglese.
-- Da lanciare una volta nel SQL editor di Supabase.
-- (Solo colonne nuove su tabelle che esistono già: i GRANT non servono.)

alter table schedule
  add column if not exists piattaforme text[] not null default '{twitch}';

alter table schedule
  drop constraint if exists schedule_piattaforme_valide;
alter table schedule
  add constraint schedule_piattaforme_valide
  check (
    cardinality(piattaforme) > 0
    and piattaforme <@ array['twitch', 'tiktok']::text[]
  );

alter table news
  add column if not exists titolo_en text,
  add column if not exists testo_en text;

alter table events
  add column if not exists titolo_en text,
  add column if not exists descrizione_en text;
