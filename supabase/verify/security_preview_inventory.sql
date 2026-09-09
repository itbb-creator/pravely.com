select jsonb_build_object(
  'tables', (
    select jsonb_agg(jsonb_build_object('name', c.relname, 'rls', c.relrowsecurity) order by c.relname)
    from pg_class c join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='public' and c.relkind='r'
  ),
  'role_grants', (
    select jsonb_agg(jsonb_build_object('table', table_name, 'role', grantee, 'privilege', privilege_type) order by table_name,grantee,privilege_type)
    from information_schema.role_table_grants
    where table_schema='public' and grantee in ('anon','authenticated','service_role')
  ),
  'policies', (
    select jsonb_agg(jsonb_build_object('table', tablename, 'policy', policyname, 'roles', roles, 'command', cmd, 'using', qual, 'check', with_check) order by tablename,policyname)
    from pg_policies where schemaname='public'
  ),
  'storage', (
    select jsonb_agg(jsonb_build_object('bucket',id,'public',public) order by id)
    from storage.buckets
  )
) as security_inventory;
