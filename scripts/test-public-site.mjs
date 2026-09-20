import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const output = new URL('../site-dist/', import.meta.url);
const publicPages = (await readdir(output)).filter((name) => /\.(?:html|json)$/.test(name));
const text = (await Promise.all(publicPages.map((name) => readFile(new URL(name, output), 'utf8')))).join('\n');
const featurePage = await readFile(new URL('features.html', output), 'utf8');

for (const forbidden of [
  /coming soon/i,
  /beta member/i,
  /href=["']#["']/i,
  /Good morning, Jordan/i,
  /\$36\b/,
  /Every free Pravely account includes/i,
]) assert.doesNotMatch(text, forbidden);

assert.doesNotMatch(text, /"instagram"\s*:\s*"#"/i);
assert.doesNotMatch(text, /"tiktok"\s*:\s*"#"/i);
assert.match(text, /Feature availability/i);
assert.match(text, /facebook\.com\/profile\.php\?id=61593162213256/i);
assert.match(text, /instagram\.com\/pravelyofficial/i);
assert.match(text, /tiktok\.com\/@pravelyus/i);
assert.match(text, /\$69 founding price/i);
assert.match(text, /\$139 founding price/i);
assert.match(text, /normally \$169/i);
assert.match(text, /\$90 one time/i);
assert.doesNotMatch(text, /\$159\b|\$70\b/i);
assert.doesNotMatch(featurePage, /Pravely (?:internal|business) accounting/i);

for (const privatePath of [
  'docs',
  'scripts',
  'supabase',
  'marketing',
  'tmp',
  'node_modules',
  'assets/masters',
  '.env.supabase.example',
]) {
  await assert.rejects(access(new URL(privatePath, output)), `Private path was published: ${privatePath}`);
}

console.log(`Public-site audit passed across ${publicPages.length} HTML/JSON files; internal paths are excluded.`);
