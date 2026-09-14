create extension if not exists pgcrypto with schema extensions;
create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

create table if not exists public.backup_runs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  status text not null default 'running' check (status in ('running', 'succeeded', 'failed')),
  source_buckets text[] not null default array['workbook-masters','licensed-workbooks','business-receipts']::text[],
  object_count bigint not null default 0 check (object_count >= 0),
  byte_count bigint not null default 0 check (byte_count >= 0),
  manifest_key text,
  manifest_sha256 text,
  error_message text
);

comment on table public.backup_runs is
  'Operational metadata for independent encrypted file backups. Customer object paths and contents are deliberately excluded.';

alter table public.backup_runs enable row level security;
revoke all on public.backup_runs from anon, authenticated;
grant select on public.backup_runs to authenticated;
grant all on public.backup_runs to service_role;

drop policy if exists "MFA administrators read backup status" on public.backup_runs;
create policy "MFA administrators read backup status"
  on public.backup_runs for select to authenticated
  using (
    ((select auth.jwt())->'app_metadata'->>'role') = 'admin'
    and ((select auth.jwt())->>'aal') = 'aal2'
  );

create table if not exists public.backup_runtime_config (
  singleton boolean primary key default true check (singleton),
  trigger_token_hash text not null,
  created_at timestamptz not null default now(),
  rotated_at timestamptz not null default now()
);

comment on table public.backup_runtime_config is
  'Service-only hash used to authenticate the database scheduler to the backup Edge Function.';

alter table public.backup_runtime_config enable row level security;
revoke all on public.backup_runtime_config from anon, authenticated;
grant all on public.backup_runtime_config to service_role;

do $$
declare
  token text;
begin
  select decrypted_secret into token
    from vault.decrypted_secrets
   where name = 'pravely_backup_cron_token'
   limit 1;

  if token is null then
    token := encode(extensions.gen_random_bytes(32), 'hex');
    perform vault.create_secret(
      token,
      'pravely_backup_cron_token',
      'Authenticates the private daily Pravely backup scheduler.'
    );
  end if;

  insert into public.backup_runtime_config(singleton, trigger_token_hash)
  values (
    true,
    encode(extensions.digest(convert_to(token, 'UTF8'), 'sha256'), 'hex')
  )
  on conflict (singleton) do update
    set trigger_token_hash = excluded.trigger_token_hash,
        rotated_at = now();
end
$$;
