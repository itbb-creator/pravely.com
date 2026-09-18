import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// This repository owns the marketing site. The database migrations and the
// edge functions moved to the Pravely app repository, and their assertions
// moved with them — see script/test-database-hardening.ts and
// script/test-function-hardening.ts there.

const marketing = await readFile(new URL('../index.html', import.meta.url), 'utf8');
for (const feature of ['Expanded projections', 'Bill dates and calendar', 'Credit card tracker', 'Optional bank synchronization', 'Household and partner sharing', 'Customization options']) {
  assert.match(marketing, new RegExp(feature, 'i'));
}

console.log('Marketing-claim checks passed.');
