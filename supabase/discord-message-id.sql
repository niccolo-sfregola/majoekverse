-- Id del messaggio Discord di news ed eventi, per poterlo modificare dopo.
-- È "text" perché gli id Discord sono troppo grandi per i numeri di
-- JavaScript (verrebbero arrotondati).
-- Le tabelle esistono già e hanno già i loro GRANT: una colonna nuova li
-- eredita, non serve altro.
-- Da lanciare una volta nel SQL editor di Supabase.

alter table news
  add column if not exists discord_message_id text;

alter table events
  add column if not exists discord_message_id text;

-- Collega la news "MARATONA TWITCH HALLOWEEN 2026 👻" (id 8) al messaggio
-- già pubblicato su Discord prima di questa modifica.
update news
  set discord_message_id = '1563188362318192723'
  where id = 8;
