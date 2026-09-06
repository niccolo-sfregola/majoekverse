-- Storage per i loghi degli sponsor: lettura pubblica, scrittura solo admin.
-- Da lanciare una volta nel SQL editor di Supabase.

insert into storage.buckets (id, name, public)
values ('sponsor-logos', 'sponsor-logos', true)
on conflict (id) do nothing;

drop policy if exists "sponsor logos public read" on storage.objects;
drop policy if exists "sponsor logos admin insert" on storage.objects;
drop policy if exists "sponsor logos admin update" on storage.objects;
drop policy if exists "sponsor logos admin delete" on storage.objects;

create policy "sponsor logos public read"
  on storage.objects for select
  using (bucket_id = 'sponsor-logos');

create policy "sponsor logos admin insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'sponsor-logos' and public.is_admin());

create policy "sponsor logos admin update"
  on storage.objects for update to authenticated
  using (bucket_id = 'sponsor-logos' and public.is_admin());

create policy "sponsor logos admin delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'sponsor-logos' and public.is_admin());
