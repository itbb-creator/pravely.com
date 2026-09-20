/**
 * The feature truth table and the page built from it must agree.
 *
 * This file used to be test-release-hardening.mjs, and every assertion in it
 * read a migration or an edge function belonging to the app repository — five
 * .sql files, _shared/delete-customer-data.ts and health-coach/index.ts. The
 * backend moved out of this repository; the assertions did not, so they were
 * checking a frozen copy of code that production does not run. The app repo
 * covers all of it in script/test-database-hardening.ts and
 * script/test-function-hardening.ts, against the migrations it actually
 * deploys.
 *
 * What remains is the half this repository genuinely owns.
 *
 * Usage: npm run test:feature-page
 */

import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const result = spawnSync(
  process.execPath,
  [join(ROOT, 'scripts', 'build-feature-page.mjs'), '--check'],
  { stdio: 'inherit' },
);

if (result.status !== 0) {
  console.error('features.html does not match the truth table. Run: npm run build:features');
  process.exit(result.status ?? 1);
}
console.log('Feature page matches the truth table.');
