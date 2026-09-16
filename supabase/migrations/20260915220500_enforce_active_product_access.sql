-- Enforce the product paywall at the database boundary as well as in the UI.
-- Expired customers retain access to the service-role deletion functions, but
-- cannot read or change financial workspace data through the public API.
create or replace function public.has_active_product_access()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.app_entitlements entitlement
    where entitlement.user_id = (select auth.uid())
      and entitlement.plan_id in ('plus', 'complete')
      and (
        entitlement.status = 'active'
        or (
          entitlement.status = 'trialing'
          and entitlement.trial_ends_at is not null
          and entitlement.trial_ends_at > now()
        )
      )
  );
$$;

revoke all on function public.has_active_product_access() from public, anon;
grant execute on function public.has_active_product_access() to authenticated;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'budget_entries',
    'goals',
    'debts',
    'net_worth_items',
    'user_settings',
    'push_device_tokens'
  ] loop
    execute format('drop policy if exists "Require active Pravely access" on public.%I', table_name);
    execute format(
      'create policy "Require active Pravely access" on public.%I as restrictive for all to authenticated using (public.has_active_product_access()) with check (public.has_active_product_access())',
      table_name
    );
  end loop;
end
$$;
