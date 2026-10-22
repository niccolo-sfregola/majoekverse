-- ============================================================
-- Foto nelle news e negli eventi.
-- Da eseguire una volta nel SQL Editor di Supabase.
-- ============================================================

-- 1. Una colonna per l'URL della foto (vuota = niente foto).
alter table public.news   add column if not exists immagine text;
alter table public.events add column if not exists immagine text;

-- 2. Storage per le foto: lettura pubblica, scrittura solo admin
--    (stesse regole del bucket dei loghi sponsor).
--    5 MB massimo: il browser le rimpicciolisce prima, ma meglio un limite.
insert into storage.buckets (id, name, public, file_size_limit)
values ('content-images', 'content-images', true, 5242880)
on conflict (id) do nothing;

drop policy if exists "content images public read" on storage.objects;
drop policy if exists "content images admin insert" on storage.objects;
drop policy if exists "content images admin update" on storage.objects;
drop policy if exists "content images admin delete" on storage.objects;

create policy "content images public read"
  on storage.objects for select
  using (bucket_id = 'content-images');

create policy "content images admin insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'content-images' and public.is_admin());

create policy "content images admin update"
  on storage.objects for update to authenticated
  using (bucket_id = 'content-images' and public.is_admin());

create policy "content images admin delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'content-images' and public.is_admin());
