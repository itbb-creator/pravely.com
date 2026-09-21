/**
 * Proves the three legal pages are published, consistent, and reachable.
 *
 * This exists because they were none of those things. The privacy policy named
 * In The Black Budget LLC and the terms named it too, months after the entity
 * became Pravely LLC; the EULA did not exist at all. Nothing caught any of it,
 * because nothing compared the pages to each other or checked they were linked.
 *
 * The check that would have caught the entity mismatch is the one asserting no
 * page carries the old name. The check that matters most in a year's time is
 * the footer one: a legal page goes missing because a footer was never updated,
 * not because someone deleted the file.
 *
 * Usage: npm run test:legal-pages
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

let failures = 0;
const check = (condition, label) => {
  if (condition) {
    console.log(`  ok   ${label}`);
  } else {
    console.error(`  FAIL ${label}`);
    failures += 1;
  }
};

const LEGAL_PAGES = ['privacy.html', 'terms.html', 'eula.html'];
const ENTITY = 'Pravely LLC';
const FORMER_ENTITY = 'In The Black Budget LLC';
const LAST_UPDATED = 'September 20, 2026';
const CONTACTS = ['support@pravely.com', 'itbb@intheblackbudget.com'];

const read = (name) => readFileSync(join(ROOT, name), 'utf8');
const pages = Object.fromEntries(LEGAL_PAGES.map((name) => [name, read(name)]));

console.log('Each legal page says who and when');
for (const [name, html] of Object.entries(pages)) {
  check(html.includes(ENTITY), `${name} names ${ENTITY}`);
  // The entity was renamed. A page still carrying the old one is a page that
  // was missed, whatever else it says.
  check(!html.includes(FORMER_ENTITY), `${name} does not name ${FORMER_ENTITY}`);
  check(html.includes(LAST_UPDATED), `${name} is dated ${LAST_UPDATED}`);
  for (const address of CONTACTS) {
    check(html.includes(address), `${name} carries ${address}`);
  }
  // Termly's editor markers are meaningless outside its editor, and a
  // <bdt class="question"> left in place would render its answer as nothing.
  check(!html.includes('<bdt'), `${name} carries no leftover editor markup`);
}

console.log('\nUnanswered generator blanks are the ones we know about');
// Termly leaves __________ where a questionnaire answer is missing. The three
// in the privacy policy were its data-request link, and are resolved. The rest
// are a notice method, a firmware version, and the licensor's own name and
// state, which are the owner's to answer in Termly rather than ours to invent.
// Pinning the count is what makes a regenerated document that introduces a new
// blank fail here instead of publishing a broken sentence.
const EXPECTED_BLANKS = { 'privacy.html': 0, 'terms.html': 1, 'eula.html': 4 };
for (const [name, expected] of Object.entries(EXPECTED_BLANKS)) {
  const found = pages[name].split('__________').length - 1;
  check(found === expected,
    `${name} has ${expected} unfilled generator blank(s) (found ${found})`);
}

console.log('\nThe workbook licence survived the move out of the terms');
// Section 7 of the old hand-written terms said this. Neither new document
// mentions workbooks, and every delivered copy really is stamped with a licence
// ID, so the statement has to live somewhere.
check(
  pages['eula.html'].includes('Workbooks are licensed, not sold'),
  'eula.html states that workbooks are licensed rather than sold',
);
check(
  pages['eula.html'].includes('unique license ID'),
  'eula.html states that a copy may carry a unique license ID',
);

console.log('\nEvery page is published and indexed');
const build = read('scripts/build-public-site.mjs');
const sitemap = read('sitemap.xml');
for (const name of LEGAL_PAGES) {
  // Not in the allowlist means not copied to site-dist, which means a 404 at
  // the end of every link below.
  check(build.includes(`'${name}'`), `${name} is in the publicFiles allowlist`);
  check(sitemap.includes(`/${name}</loc>`), `${name} is in the sitemap`);
}

console.log('\nEvery footer that links one legal page links all three');
// This is the check with the longest shelf life. Adding a page is easy; the
// way it goes missing is a footer somewhere that nobody remembered.
const linkingFiles = [
  'index.html', 'features.html', 'account.html', 'contact.html',
  'changelog.html', 'scripts/build-feature-page.mjs',
  ...LEGAL_PAGES,
];
for (const name of linkingFiles) {
  const html = read(name);
  if (!html.includes('terms.html')) continue;
  for (const target of LEGAL_PAGES) {
    check(html.includes(target), `${name} links ${target}`);
  }
}

console.log(`\n${failures === 0 ? 'The legal pages are consistent and reachable.' : `${failures} legal-page check(s) failed.`}`);
process.exit(failures === 0 ? 0 : 1);
