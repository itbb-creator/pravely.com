import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const outputUrl = new URL('../site-dist/', import.meta.url);
const outputPath = fileURLToPath(outputUrl);
const htmlFiles = (await readdir(outputUrl)).filter((name) => name.endsWith('.html'));
const knownRoutes = new Map([
  ['/', 'index.html'],
  ['/changelog', 'changelog.html'],
  ['/features', 'features.html'],
  ['/onboarding', 'onboarding.html'],
  ['/account', 'account.html'],
]);
const failures = [];

for (const file of htmlFiles) {
  const contents = await readFile(new URL(file, outputUrl), 'utf8');
  const attributes = [...contents.matchAll(/\b(?:href|src)=["']([^"']+)["']/gi)].map((match) => match[1]);
  for (const original of attributes) {
    if (/^(?:https?:|mailto:|data:|javascript:|#)/i.test(original)) continue;
    const withoutSuffix = original.split(/[?#]/, 1)[0];
    if (!withoutSuffix) continue;
    const routeKey = withoutSuffix.startsWith('./') ? `/${withoutSuffix.slice(2)}` : withoutSuffix;
    const routed = knownRoutes.get(routeKey);
    const candidate = routed
      ? resolve(outputPath, routed)
      : withoutSuffix.startsWith('/')
        ? resolve(outputPath, withoutSuffix.slice(1))
        : resolve(dirname(resolve(outputPath, file)), withoutSuffix);
    try {
      await access(candidate);
    } catch {
      failures.push(`${file}: ${original}`);
    }
  }
}

assert.deepEqual(failures, [], `Broken internal public links:\n${failures.join('\n')}`);
console.log(`Internal link audit passed across ${htmlFiles.length} public pages.`);
