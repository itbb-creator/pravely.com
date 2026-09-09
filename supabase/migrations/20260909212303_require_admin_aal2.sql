-- Administrator authorization is not sufficient for sensitive accounting and
-- operational access: the current access token must also prove MFA (AAL2).

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'business_accounts',
    'business_contacts',
    'business_reconciliations',
    'business_transactions',
    'business_transaction_lines',
    'business_invoices',
    'business_invoice_items',
    'business_recurring_expenses',
    'business_audit_log'
  ] loop
    execute format('drop policy if exists "Require administrator MFA" on public.%I', table_name);
    execute format(
      'create policy "Require administrator MFA" on public.%I as restrictive for all to authenticated using (((select auth.jwt()) ->> ''aal'') = ''aal2'') with check (((select auth.jwt()) ->> ''aal'') = ''aal2'')',
      table_name
    );
  end loop;
end $$;

alter policy "Admins read operational events"
  on public.operational_events
  using (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
    and ((select auth.jwt()) ->> 'aal') = 'aal2'
  );

alter policy "Customers or admins read feedback"
  on public.app_feedback
  using (
    (select auth.uid()) = user_id
    or (
      ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
      and ((select auth.jwt()) ->> 'aal') = 'aal2'
    )
  );

alter policy "Admins update feedback workflow"
  on public.app_feedback
  using (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
    and ((select auth.jwt()) ->> 'aal') = 'aal2'
  )
  with check (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
    and ((select auth.jwt()) ->> 'aal') = 'aal2'
  );

alter policy "Admins delete resolved feedback"
  on public.app_feedback
  using (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
    and ((select auth.jwt()) ->> 'aal') = 'aal2'
    and status = 'resolved'
  );

alter policy "Admin reads own business receipts"
  on storage.objects
  using (
    bucket_id = 'business-receipts'
    and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
    and ((select auth.jwt()) ->> 'aal') = 'aal2'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

alter policy "Admin uploads own business receipts"
  on storage.objects
  with check (
    bucket_id = 'business-receipts'
    and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
    and ((select auth.jwt()) ->> 'aal') = 'aal2'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

alter policy "Admin updates own business receipts"
  on storage.objects
  using (
    bucket_id = 'business-receipts'
    and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
    and ((select auth.jwt()) ->> 'aal') = 'aal2'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'business-receipts'
    and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
    and ((select auth.jwt()) ->> 'aal') = 'aal2'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

alter policy "Admin deletes own business receipts"
  on storage.objects
  using (
    bucket_id = 'business-receipts'
    and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
    and ((select auth.jwt()) ->> 'aal') = 'aal2'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create or replace function private.audit_business_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  row_data jsonb;
  row_owner uuid;
  row_id text;
begin
  row_data := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
  row_owner := (row_data->>'owner_id')::uuid;
  row_id := row_data->>'id';
  if (select auth.uid()) is null
    or (select auth.uid()) <> row_owner
    or ((select auth.jwt())->'app_metadata'->>'role') <> 'admin'
    or ((select auth.jwt())->>'aal') is distinct from 'aal2'
  then
    raise exception 'Accounting audit authorization failed';
  end if;
  insert into public.business_audit_log(owner_id, table_name, record_id, action, snapshot)
  values(row_owner, tg_table_name, row_id, tg_op, row_data);
  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

revoke all on function private.audit_business_change() from public, anon, authenticated;
