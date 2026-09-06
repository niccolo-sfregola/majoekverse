-- FIX per "permission denied for table twitch_credentials".
-- Concede esplicitamente i privilegi al ruolo service_role (e a postgres).
-- Da lanciare nel SQL editor di Supabase.

grant all privileges on table public.twitch_credentials to service_role;
grant all privileges on table public.twitch_credentials to postgres;

-- Verifica: dovresti vedere service_role con SELECT/INSERT/UPDATE/DELETE.
select grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public' and table_name = 'twitch_credentials'
order by grantee, privilege_type;
