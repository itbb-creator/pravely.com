import { copyFile, cp, mkdir, rm } from 'node:fs/promises';
import { basename } from 'node:path';

const root = new URL('../', import.meta.url);
const output = new URL('../site-dist/', import.meta.url);
if (basename(output.pathname.replace(/\/$/, '')) !== 'site-dist') throw new Error('Unexpected public output path.');

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

const publicFiles = [
  '404.html',
  'account.html',
  'account.js',
  'app-401-response.html',
  'changelog.html',
  'confirmation.html',
  'confirmation.js',
  'contact-success.html',
  'contact.html',
  'contact.js',
  'content.json',
  'download.html',
  'email-preferences.html',
  'favicon.ico',
  'favicon.png',
  'favicon.svg',
  'features.html',
  'index.html',
  'onboarding.html',
  'privacy.html',
  'recovery.html',
  'recovery.js',
  'robots.txt',
  'sitemap.xml',
  'terms.html',
];

for (const relative of publicFiles) {
  await copyFile(new URL(relative, root), new URL(relative, output));
}

await mkdir(new URL('images/', output), { recursive: true });
for (const name of [
  'apple-touch-icon.png',
  'dashboard.png',
  'og-image.png',
  'pravely-app-icon.png',
  'pravely-logo-horizontal.png',
]) {
  await copyFile(new URL(`images/${name}`, root), new URL(`images/${name}`, output));
}

await mkdir(new URL('assets/', output), { recursive: true });
await cp(new URL('assets/onboarding/', root), new URL('assets/onboarding/', output), { recursive: true });

console.log(`Built public site with ${publicFiles.length} top-level files and an explicit asset allowlist.`);
