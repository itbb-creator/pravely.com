-- Server-only, atomic per-user quota for the paid Health Coach endpoint.
create table public.health_coach_rate_limits (
  user_id uuid not null references auth.users(id) on delete cascade,
  window_started_at timestamptz not null,
  request_count integer not null check (request_count > 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, window_started_at)
);

alter table public.health_coach_rate_limits enable row level security;
revoke all on table public.health_coach_rate_limits from public, anon, authenticated;
grant all on table public.health_coach_rate_limits to service_role;

create or replace function public.consume_health_coach_quota(
  p_user_id uuid,
  p_limit integer default 20
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  accepted boolean;
  current_window timestamptz := date_trunc('hour', now());
  bounded_limit integer := greatest(1, least(coalesce(p_limit, 20), 100));
begin
  delete from public.health_coach_rate_limits
  where user_id = p_user_id
    and window_started_at < current_window - interval '24 hours';

  insert into public.health_coach_rate_limits (
    user_id, window_started_at, request_count, updated_at
  ) values (
    p_user_id, current_window, 1, now()
  )
  on conflict (user_id, window_started_at) do update
    set request_count = public.health_coach_rate_limits.request_count + 1,
        updated_at = now()
    where public.health_coach_rate_limits.request_count < bounded_limit
  returning true into accepted;

  return coalesce(accepted, false);
end;
$$;

revoke all on function public.consume_health_coach_quota(uuid, integer) from public, anon, authenticated;
grant execute on function public.consume_health_coach_quota(uuid, integer) to service_role;

create index health_coach_rate_limits_updated_at_idx
  on public.health_coach_rate_limits (updated_at);

-- A single fixed-content founder alert may be sent per alert type and cooldown.
-- No prompt, financial value, user id, or account content is stored here.
create table public.health_coach_alert_state (
  alert_key text primary key check (alert_key in ('provider_outage', 'configuration_failure')),
  last_sent_at timestamptz not null default now()
);

alter table public.health_coach_alert_state enable row level security;
revoke all on table public.health_coach_alert_state from public, anon, authenticated;
grant all on table public.health_coach_alert_state to service_role;

create or replace function public.reserve_health_coach_alert(
  p_alert_key text,
  p_cooldown_minutes integer default 60
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  accepted boolean;
  bounded_cooldown integer := greatest(5, least(coalesce(p_cooldown_minutes, 60), 1440));
begin
  if p_alert_key not in ('provider_outage', 'configuration_failure') then
    return false;
  end if;

  insert into public.health_coach_alert_state (alert_key, last_sent_at)
  values (p_alert_key, now())
  on conflict (alert_key) do update
    set last_sent_at = now()
    where public.health_coach_alert_state.last_sent_at <=
      now() - make_interval(mins => bounded_cooldown)
  returning true into accepted;

  return coalesce(accepted, false);
end;
$$;

revoke all on function public.reserve_health_coach_alert(text, integer) from public, anon, authenticated;
grant execute on function public.reserve_health_coach_alert(text, integer) to service_role;
