import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// This repository owns the marketing site and the workbook-delivery functions.
// The database migrations and their assertions moved to the Pravely app
// repository, which now defines the backend; see script/test-database-hardening.ts
// there. What remains here is what this repository still owns.

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
assert.match(aiFunction, /OPENAI_KEY_ENV/);
assert.match(aiFunction, /OPENAI_API_KEY_PREVIEW/);
assert.match(aiFunction, /OPENAI_API_KEY_PRODUCTION/);
assert.doesNotMatch(aiFunction, /console\.(?:log|info|error)\([^\n]*(?:prompt|financial|input)/i);

const marketing = await readFile(new URL('../index.html', import.meta.url), 'utf8');
for (const feature of ['Expanded projections', 'Bill dates and calendar', 'Credit card tracker', 'Optional bank synchronization', 'Household and partner sharing', 'Customization options']) {
  assert.match(marketing, new RegExp(feature, 'i'));
}

console.log('AI hardening and marketing-claim checks passed.');
