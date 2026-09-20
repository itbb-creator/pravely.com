/**
 * The approved Pravely web-launch offer.
 *
 * Customer-facing prices, Checkout validation, tests, and release notes must
 * derive from or be checked against this catalog. Changing a Stripe Price ID
 * does not change these approved amounts.
 *
 * ── This file is a mirror ──────────────────────────────────────────────────
 * The canonical copy lives in the Pravely app repository, at the same path,
 * where it is what Checkout charges. This repository is separate and public,
 * so it cannot import that file; a copy is the only way the site can be
 * checked against the amounts the app actually bills.
 *
 * Change both together, in the same sitting. scripts/test-pricing.mjs proves
 * that the site matches this file; nothing can prove that this file matches
 * the app except doing it. The amounts are published prices — there is
 * nothing here that is not already on the pricing page.
 */
export const PRODUCT_CATALOG = {
  effectiveDate: "2026-09-19",
  currency: "usd",
  territory: "US",
  trialDays: 7,
  activeOffer: "founding",
  foundingOffer: {
    label: "Founding offer",
    /**
     * Launch day, as a plain YYYY-MM-DD date read in UTC.
     *
     * Null until the offer actually opens. The countdown cannot start before
     * there is something to buy, and a guessed date published on the site
     * would be a promise to customers that nobody made. Set this on launch day
     * and the deadline, the site copy, and the server-side cutoff all follow
     * from it.
     */
    launchDate: null as string | null,
    /**
     * The offer closes at whichever comes first: the window expiring, or the
     * seats running out.
     */
    windowDays: 60,
    seatLimit: 75,
    /**
     * The first buyers to reach Complete are also offered a 30-minute
     * onboarding session. Counted separately from the seat number, because a
     * founder who starts on Plus and upgrades later is still a Complete buyer.
     */
    completeOnboardingSeats: 20,
    plus: { amountCents: 6_900, regularAmountCents: 8_900 },
    complete: { amountCents: 13_900, regularAmountCents: 16_900 },
    completeUpgrade: { amountCents: 9_000 },
  },
  regularOffer: {
    plus: { amountCents: 8_900 },
    complete: { amountCents: 16_900 },
    completeUpgrade: { amountCents: 9_000 },
  },
} as const;

export const ACTIVE_PRICES = PRODUCT_CATALOG.foundingOffer;

export function dollars(amountCents: number) {
  return amountCents / 100;
}

const DAY_MS = 86_400_000;

/**
 * The instant the founding window expires, or null before launch.
 *
 * Deliberately UTC. Reading the date in local time would move the deadline by
 * a day depending on where it is read, and the offer is a published promise
 * rather than a rendering detail.
 */
export function foundingOfferClosesAt(
  launchDate: string | null = PRODUCT_CATALOG.foundingOffer.launchDate,
): Date | null {
  if (!launchDate) return null;
  const opened = new Date(`${launchDate}T00:00:00.000Z`);
  if (Number.isNaN(opened.getTime())) return null;
  return new Date(opened.getTime() + PRODUCT_CATALOG.foundingOffer.windowDays * DAY_MS);
}

export type FoundingOfferStatus = {
  open: boolean;
  /** Why the offer is in this state — for copy, and for logs. */
  reason: "open" | "not_launched" | "window_closed" | "sold_out";
  closesAt: Date | null;
  seatsTaken: number;
  seatsRemaining: number;
};

/**
 * Whether a founding seat can still be claimed.
 *
 * Both limits are checked, because either one alone would be the wrong offer:
 * sixty days with unlimited seats is not a cohort of 75, and 75 seats with no
 * deadline never ends if only sixty people buy.
 */
export function foundingOfferStatus(input?: {
  now?: Date;
  seatsTaken?: number;
  launchDate?: string | null;
}): FoundingOfferStatus {
  const now = input?.now ?? new Date();
  const seatsTaken = input?.seatsTaken ?? 0;
  const launchDate = input?.launchDate === undefined
    ? PRODUCT_CATALOG.foundingOffer.launchDate
    : input.launchDate;
  const closesAt = foundingOfferClosesAt(launchDate);
  const seatsRemaining = Math.max(0, PRODUCT_CATALOG.foundingOffer.seatLimit - seatsTaken);

  if (!closesAt) {
    return { open: false, reason: "not_launched", closesAt: null, seatsTaken, seatsRemaining };
  }
  if (seatsRemaining === 0) {
    return { open: false, reason: "sold_out", closesAt, seatsTaken, seatsRemaining };
  }
  if (now.getTime() >= closesAt.getTime()) {
    return { open: false, reason: "window_closed", closesAt, seatsTaken, seatsRemaining };
  }
  return { open: true, reason: "open", closesAt, seatsTaken, seatsRemaining };
}
