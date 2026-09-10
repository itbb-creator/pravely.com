with checks as (
  select 'all public tables have RLS' as check_name,
    not exists (
      select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity
    ) as passed,
    coalesce((
      select string_agg(c.relname, ', ' order by c.relname)
      from pg_class c join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity
    ), 'none') as detail
  union all
  select 'all public constraints validated',
    not exists (
      select 1 from pg_constraint c join pg_namespace n on n.oid = c.connamespace
      where n.nspname = 'public' and not c.convalidated
    ),
    coalesce((
      select string_agg(c.conname, ', ' order by c.conname)
      from pg_constraint c join pg_namespace n on n.oid = c.connamespace
      where n.nspname = 'public' and not c.convalidated
    ), 'none')
  union all
  select 'all eleven security columns exist', count(*) = 11, count(*)::text
    from information_schema.columns
    where table_schema = 'public' and (
      (table_name = 'user_settings' and column_name = 'welcome_completed_at') or
      (table_name = 'licenses' and column_name in ('download_capability_hash','download_capability_rotated_at','checkout_handoff_consumed_at')) or
      table_name = 'data_deletion_jobs'
    )
  union all
  select 'download capability unique index exists',
    exists (select 1 from pg_indexes where schemaname='public' and indexname='licenses_download_capability_hash_idx'),
    coalesce((select indexdef from pg_indexes where schemaname='public' and indexname='licenses_download_capability_hash_idx'), 'missing')
  union all
  select 'download capability format constraint exists and is valid',
    exists (select 1 from pg_constraint where conname='licenses_download_capability_hash_format' and convalidated),
    coalesce((select pg_get_constraintdef(oid) from pg_constraint where conname='licenses_download_capability_hash_format'), 'missing')
  union all
  select 'deletion ledger blocks browser roles',
    not has_table_privilege('anon','public.data_deletion_jobs','select')
      and not has_table_privilege('authenticated','public.data_deletion_jobs','select')
      and has_table_privilege('service_role','public.data_deletion_jobs','select,insert,update,delete'),
    format('anon=%s authenticated=%s service=%s',
      has_table_privilege('anon','public.data_deletion_jobs','select'),
      has_table_privilege('authenticated','public.data_deletion_jobs','select'),
      has_table_privilege('service_role','public.data_deletion_jobs','select,insert,update,delete'))
  union all
  select 'license records block browser roles',
    not has_table_privilege('anon','public.licenses','select')
      and not has_table_privilege('authenticated','public.licenses','select')
      and has_table_privilege('service_role','public.licenses','select,insert,update,delete'),
    format('anon=%s authenticated=%s service=%s',
      has_table_privilege('anon','public.licenses','select'),
      has_table_privilege('authenticated','public.licenses','select'),
      has_table_privilege('service_role','public.licenses','select,insert,update,delete'))
  union all
  select 'all three sensitive Storage buckets are private', count(*) = 3, count(*)::text
    from storage.buckets
    where id in ('workbook-masters','licensed-workbooks','business-receipts') and not public
  union all
  select 'public views are invoker-secured and browser-inaccessible',
    not exists (
      select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace
      where n.nspname='public' and c.relkind='v'
        and (not ('security_invoker=true'=any(coalesce(c.reloptions,array[]::text[])))
          or has_table_privilege('anon',c.oid,'select')
          or has_table_privilege('authenticated',c.oid,'select'))
    ),
    (select count(*)::text from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='v')
  union all
  select 'no public SECURITY DEFINER functions', count(*) = 0, count(*)::text
    from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.prosecdef
)
select check_name, passed, detail from checks order by check_name;
