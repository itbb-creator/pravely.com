-- Customer deletion is performed by authenticated Edge Functions using the
-- service role. Grant that role only the tables and sequences the deletion
-- workflow must inspect or remove.
grant select, insert, update, delete on table
  public.budget_entries,
  public.goals,
  public.debts,
  public.net_worth_items,
  public.user_settings,
  public.app_feedback,
  public.operational_events,
  public.business_accounts,
  public.business_contacts,
  public.business_reconciliations,
  public.business_transactions,
  public.business_transaction_lines,
  public.business_invoices,
  public.business_invoice_items,
  public.business_recurring_expenses,
  public.business_audit_log
to service_role;

grant usage, select on all sequences in schema public to service_role;

-- Normal accounting writes still require an MFA-authenticated administrator.
-- Service-role maintenance (including verified customer deletion) is allowed;
-- its generated audit rows are removed as part of the same deletion job.
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
  if (select auth.role()) <> 'service_role' and (
    (select auth.uid()) is null
    or (select auth.uid()) <> row_owner
    or ((select auth.jwt())->'app_metadata'->>'role') <> 'admin'
  ) then
    raise exception 'Accounting audit authorization failed';
  end if;
  insert into public.business_audit_log(owner_id, table_name, record_id, action, snapshot)
  values(row_owner, tg_table_name, row_id, tg_op, row_data);
  return case when tg_op = 'DELETE' then old else new end;
end
$$;

revoke execute on function private.audit_business_change() from public, anon, authenticated;
