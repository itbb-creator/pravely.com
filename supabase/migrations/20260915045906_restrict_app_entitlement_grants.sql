-- Entitlements are written only by trusted service-role purchase workflows.
-- Customers need read access to their own row; RLS supplies row ownership.
revoke all on table public.app_entitlements from anon, authenticated;
grant select on table public.app_entitlements to authenticated;
