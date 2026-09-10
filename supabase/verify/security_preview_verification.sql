-- Read-only verification for the Pravely preview schema.
select 'summary' as section,
  (select count(*) from information_schema.tables where table_schema = 'public' and table_type = 'BASE TABLE') as public_tables,
  (select count(*) from pg_policies where schemaname = 'public') as public_policies,
  (select count(*) from pg_constraint c join pg_namespace n on n.oid = c.connamespace where n.nspname = 'public') as public_constraints;

select 'tables_without_rls' as section, c.relname as finding
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity
order by c.relname;

select 'unvalidated_constraints' as section, c.conname as finding
from pg_constraint c join pg_namespace n on n.oid = c.connamespace
where n.nspname = 'public' and not c.convalidated
order by c.conname;

select 'security_columns' as section, table_name, column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public' and (
  (table_name = 'user_settings' and column_name = 'welcome_completed_at') or
  (table_name = 'licenses' and column_name in ('download_capability_hash','download_capability_rotated_at','checkout_handoff_consumed_at')) or
  table_name = 'data_deletion_jobs'
)
order by table_name, ordinal_position;

select 'security_indexes' as section, indexname, indexdef
from pg_indexes
where schemaname = 'public' and indexname in (
  'licenses_download_capability_hash_idx',
  'data_deletion_jobs_pkey'
)
order by indexname;

select 'security_constraints' as section, c.conname, pg_get_constraintdef(c.oid) as definition, c.convalidated
from pg_constraint c
join pg_class t on t.oid = c.conrelid
join pg_namespace n on n.oid = t.relnamespace
where n.nspname = 'public' and t.relname in ('licenses','data_deletion_jobs')
order by t.relname, c.conname;

select 'critical_privileges' as section, grantee, table_name, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in ('licenses','license_events','stripe_events','data_deletion_jobs')
  and grantee in ('anon','authenticated','service_role')
order by table_name, grantee, privilege_type;

select 'all_public_grants' as section, grantee, table_name,
  string_agg(privilege_type, ',' order by privilege_type) as privileges
from information_schema.role_table_grants
where table_schema = 'public' and grantee in ('anon','authenticated','service_role')
group by grantee, table_name
order by table_name, grantee;

select 'public_policies' as section, tablename, policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

select 'storage_policies' as section, tablename, policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'storage'
order by tablename, policyname;

select 'storage_buckets' as section, id, public, file_size_limit, allowed_mime_types
from storage.buckets
where id in ('workbook-masters','licensed-workbooks','business-receipts')
order by id;

select 'public_views' as section, c.relname as view_name, c.reloptions,
  has_table_privilege('anon', c.oid, 'select') as anon_select,
  has_table_privilege('authenticated', c.oid, 'select') as authenticated_select,
  has_table_privilege('service_role', c.oid, 'select') as service_role_select
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'v'
order by c.relname;

select 'public_security_definer_functions' as section,
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as arguments,
  p.proacl as execute_acl
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.prosecdef
order by p.proname;
