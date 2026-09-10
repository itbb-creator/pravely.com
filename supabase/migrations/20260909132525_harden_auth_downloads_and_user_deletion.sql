-- Persist onboarding completion in an account-owned row instead of mutable
-- Auth user metadata. This is a preference, never an authorization claim.
alter table public.user_settings
  add column if not exists welcome_completed_at timestamptz;

-- Future paid workbook links use a high-entropy capability. Only its SHA-256
-- digest is stored, so a database read cannot reveal a usable download link.
alter table public.licenses
  add column if not exists download_capability_hash text,
  add column if not exists download_capability_rotated_at timestamptz,
  add column if not exists checkout_handoff_consumed_at timestamptz;

create unique index if not exists licenses_download_capability_hash_idx
  on public.licenses (download_capability_hash)
  where download_capability_hash is not null;

alter table public.licenses
  drop constraint if exists licenses_download_capability_hash_format;
alter table public.licenses
  add constraint licenses_download_capability_hash_format
  check (download_capability_hash is null or download_capability_hash ~ '^[0-9a-f]{64}$');

-- Privacy-safe, service-role-only completion ledger for destructive workflows.
-- The customer id is irreversibly hashed before it is recorded.
create table if not exists public.data_deletion_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id_hash text not null check (user_id_hash ~ '^[0-9a-f]{64}$'),
  scope text not null check (scope in ('financial_data', 'account')),
  status text not null check (status in ('started', 'partial', 'completed', 'blocked_admin')),
  result jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.data_deletion_jobs enable row level security;
revoke all on table public.data_deletion_jobs from public, anon, authenticated;
grant all on table public.data_deletion_jobs to service_role;
