create table if not exists public.support_requests (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) between 1 and 100),
  email text not null check (char_length(email) between 3 and 254),
  topic text not null check (topic in (
    'Account access',
    'Purchase, refund, or reinstatement',
    'Technical problem',
    'Privacy or data request',
    'Something else'
  )),
  message text not null check (char_length(message) between 1 and 5000),
  ip_hash text not null check (char_length(ip_hash) = 64),
  delivery_status text not null default 'pending' check (delivery_status in ('pending', 'sent', 'failed')),
  provider_message_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists support_requests_created_at_idx on public.support_requests (created_at desc);
create index if not exists support_requests_ip_created_idx on public.support_requests (ip_hash, created_at desc);
create index if not exists support_requests_email_created_idx on public.support_requests (lower(email), created_at desc);

alter table public.support_requests enable row level security;
revoke all on table public.support_requests from anon, authenticated;
revoke all on sequence public.support_requests_id_seq from anon, authenticated;

create policy "Admins read support requests with MFA"
on public.support_requests for select to authenticated
using (
  ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
  and ((select auth.jwt()) ->> 'aal') = 'aal2'
);

create policy "Admins update support requests with MFA"
on public.support_requests for update to authenticated
using (
  ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
  and ((select auth.jwt()) ->> 'aal') = 'aal2'
)
with check (
  ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
  and ((select auth.jwt()) ->> 'aal') = 'aal2'
);

grant select on table public.support_requests to authenticated;
grant update (delivery_status, updated_at) on table public.support_requests to authenticated;
