-- Supabase project defaults may grant broader privileges on newly-created
-- public tables. RLS does not protect TRUNCATE, so explicitly reduce this
-- customer-owned table to the four operations covered by its ownership policy.
revoke all on table public.push_device_tokens from anon, authenticated;
grant select, insert, update, delete on table public.push_device_tokens to authenticated;
grant all on table public.push_device_tokens to service_role;
