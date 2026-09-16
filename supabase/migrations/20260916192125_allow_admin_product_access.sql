-- Founder/admin accounts operate Pravely itself and are not customer plan
-- entitlements. Keep their authorization in immutable app_metadata while
-- retaining the customer paywall for every non-admin account.
create or replace function public.has_active_product_access()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    coalesce(((select auth.jwt())->'app_metadata'->>'role') = 'admin', false)
    or exists (
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
