/**
 * Proves the published prices match the approved catalog.
 *
 * This exists because they did not. The site showed $159 for Complete and $70
 * for the upgrade while the approved amounts were $169 and $90 — not a founding
 * discount, just two numbers nobody had updated. Nothing caught it, because
 * nothing compared the page to anything.
 *
 * The strongest check here is the last one: every dollar amount inside the
 * pricing section must be an approved amount. Asserting that $69 appears is
 * weak — a stale $159 sitting two lines below still passes. Asserting that
 * nothing unapproved appears is what actually catches drift.
 *
 * Usage: npm run test:pricing
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { PRODUCT_CATALOG, dollars, offerPrices } from '../shared/product-catalog.ts';

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

const founding = PRODUCT_CATALOG.foundingOffer;
const money = (cents) => `$${dollars(cents)}`;

const expected = {
  plusFounding: money(founding.plus.amountCents),
  plusRegular: money(founding.plus.regularAmountCents),
  completeFounding: money(founding.complete.amountCents),
  completeRegular: money(founding.complete.regularAmountCents),
  upgrade: money(founding.completeUpgrade.amountCents),
};

console.log('content.json matches the catalog');
const content = JSON.parse(readFileSync(join(ROOT, 'content.json'), 'utf8'));
check(content.pricing?.plus?.price === expected.plusFounding,
  `Plus is ${expected.plusFounding} (found ${content.pricing?.plus?.price})`);
check(content.pricing?.plus?.regularPrice === expected.plusRegular,
  `Plus regular price is ${expected.plusRegular} (found ${content.pricing?.plus?.regularPrice})`);
check(content.pricing?.complete?.price === expected.completeFounding,
  `Complete is ${expected.completeFounding} (found ${content.pricing?.complete?.price})`);
check(content.pricing?.complete?.regularPrice === expected.completeRegular,
  `Complete regular price is ${expected.completeRegular} (found ${content.pricing?.complete?.regularPrice})`);
check(content.pricing?.upgrade?.price === expected.upgrade,
  `Upgrade is ${expected.upgrade} (found ${content.pricing?.upgrade?.price})`);

// The saving is the entire reason both numbers are shown. A regular price that
// is not higher than the founding price is worse than showing nothing.
check(founding.plus.regularAmountCents > founding.plus.amountCents,
  'the Plus regular price is above the founding price');
check(founding.complete.regularAmountCents > founding.complete.amountCents,
  'the Complete regular price is above the founding price');

console.log('\nindex.html renders the same prices');
const html = readFileSync(join(ROOT, 'index.html'), 'utf8');

// Scoped to the pricing section on purpose. The rest of the page carries mock
// dashboard figures — $1,038 available, a $125 debt payment — which are
// illustrations, not prices, and must not be held to the catalog.
const section = html.match(/<section class="roadmap" id="plan">[\s\S]*?<\/section>/);
check(Boolean(section), 'the pricing section is where the test expects it');

if (section) {
  const pricing = section[0];
  for (const [name, value] of Object.entries(expected)) {
    check(pricing.includes(value), `${name} (${value}) appears in the pricing section`);
  }

  // "$0 to start" is the trial card, not a price in the catalog. It is the
  // one amount allowed through that the catalog does not name.
  const approved = new Set([...Object.values(expected), '$0']);
  // A comma only counts as a thousands separator. Matching [0-9,]* instead
  // swallows the comma in "instead of $89, and" and reports "$89," as an
  // unapproved amount.
  const rendered = [...new Set(pricing.match(/\$[0-9]+(?:,[0-9]{3})*/g) ?? [])];
  const unapproved = rendered.filter((amount) => !approved.has(amount));
  check(
    unapproved.length === 0,
    unapproved.length === 0
      ? 'every amount in the pricing section is an approved price'
      : `unapproved amounts in the pricing section: ${unapproved.join(', ')}`,
  );

  // Both prices are shown so a buyer can see the saving. What matters is that
  // the regular price is marked as the one being saved against — struck
  // through, or labelled "normally" — and not left to read as a second price
  // someone might be charged. Either presentation passes; neither passes if
  // the regular price is just sitting there on its own.
  const savings = [
    [expected.plusFounding, expected.plusRegular],
    [expected.completeFounding, expected.completeRegular],
  ];
  for (const [founding, regular] of savings) {
    const escaped = regular.replace('$', '\\$');
    const marked = new RegExp(`<s>${escaped}</s>|normally\\s+${escaped}`).test(pricing);
    check(marked, `${regular} is shown as the price ${founding} saves against`);
  }
}

console.log('\nThe page can switch itself to the regular offer');

// The founding offer ends on its own, and the page swaps its prices when it
// does. These check the machinery that swap depends on, because a renamed hook
// would fail silently: the page would simply keep advertising $69.
const regular = offerPrices('regular');
check(
  regular.plus.amountCents === founding.plus.regularAmountCents,
  'the regular Plus price matches what the founding offer compares against',
);
check(
  regular.complete.amountCents === founding.complete.regularAmountCents,
  'the regular Complete price matches what the founding offer compares against',
);
check(
  regular.completeUpgrade.amountCents === founding.completeUpgrade.amountCents,
  'the upgrade price does not move when the offer ends',
);
check(
  regular.plus.regularAmountCents === undefined,
  'the regular offer has nothing to strike through',
);

for (const hook of ['data-price="plus"', 'data-price="complete"', 'data-founding-block', 'data-pricing-kicker']) {
  check(html.includes(hook), `index.html carries the ${hook} hook the swap needs`);
}
check(
  html.includes('/current-offer'),
  'index.html asks the server which offer is in force',
);
check(
  /offer\.offer === 'regular' && offer\.reason !== 'not_launched'/.test(html),
  'the planned founding price remains visible before checkout opens',
);
check(
  /Founding prices begin when Pravely launches/.test(content.foundingOffer?.note || ''),
  'the marketing note does not claim the unlaunched offer is already live',
);
check(
  content.foundingOffer && 'closesAt' in content.foundingOffer,
  'content.json carries the deadline the page falls back to when the server is unreachable',
);

console.log(`\n${failures === 0 ? 'Pricing matches the approved catalog.' : `${failures} pricing check(s) failed.`}`);
process.exit(failures === 0 ? 0 : 1);
