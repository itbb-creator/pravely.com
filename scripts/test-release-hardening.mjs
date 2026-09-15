import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const goalMigration = await readFile(
  new URL('../supabase/migrations/20260915184421_preserve_goal_budget_entries.sql', import.meta.url),
  'utf8',
);
assert.match(goalMigration, /on delete set null \(goal_client_key\)/i);
assert.doesNotMatch(goalMigration, /on delete cascade/i);

const aiMigration = await readFile(
  new URL('../supabase/migrations/20260915184913_harden_health_coach.sql', import.meta.url),
  'utf8',
);
assert.match(aiMigration, /enable row level security/i);
assert.match(aiMigration, /revoke all on table public\.health_coach_rate_limits from public, anon, authenticated/i);
assert.match(aiMigration, /grant execute on function public\.consume_health_coach_quota\(uuid, integer\) to service_role/i);
assert.match(aiMigration, /revoke all on function public\.reserve_health_coach_alert\(text, integer\) from public, anon, authenticated/i);

const deletionHelper = await readFile(
  new URL('../supabase/functions/_shared/delete-customer-data.ts', import.meta.url),
  'utf8',
);
assert.match(deletionHelper, /\['health_coach_rate_limits', 'user_id'\]/);

const aiFunction = await readFile(
  new URL('../supabase/functions/health-coach/index.ts', import.meta.url),
  'utf8',
);
assert.match(aiFunction, /hasHealthCoachAccess/);
assert.match(aiFunction, /consume_health_coach_quota/);
assert.match(aiFunction, /AbortSignal\.timeout\(25_000\)/);
assert.match(aiFunction, /max_output_tokens: 700/);
assert.match(aiFunction, /HEALTH_COACH_ENABLED/);
assert.match(aiFunction, /contentLength > 20_000/);
assert.match(aiFunction, /total_tokens/);
assert.match(aiFunction, /notifyFounder/);
assert.match(aiFunction, /AI_ALERT_EMAIL/);
assert.doesNotMatch(aiFunction, /console\.(?:log|info|error)\([^\n]*(?:prompt|financial|input)/i);

const marketing = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const appSource = await readFile(new URL('../tmp/pravely-app-source/client/src/App.tsx', import.meta.url), 'utf8');
for (const feature of ['Expanded projections', 'Bill dates and calendar', 'Credit card tracker', 'Optional bank synchronization', 'Household and partner sharing', 'Customization options']) {
  assert.match(marketing, new RegExp(feature, 'i'));
  assert.match(appSource, new RegExp(feature, 'i'));
}

console.log('Goal preservation and AI release-hardening checks passed.');
