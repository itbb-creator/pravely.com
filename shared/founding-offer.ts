/**
 * What a founding purchase actually includes.
 *
 * Kept beside the price catalog and away from any one surface on purpose. The
 * app and the marketing site both describe this offer, and a customer who
 * reads one and buys from the other must not find a different promise. The
 * wording here is the promise; treat an edit as a change to what has been sold.
 */

import { PRODUCT_CATALOG } from "./product-catalog.ts";

const { seatLimit, windowDays } = PRODUCT_CATALOG.foundingOffer;

export const FOUNDING_HEADLINE =
  `Be one of the first ${seatLimit} people building a calmer, more intentional ` +
  "financial life with Pravely.";

export const FOUNDING_WINDOW_NOTE =
  `The founding offer runs for ${windowDays} days from launch, or until all ` +
  `${seatLimit} founding places are taken — whichever comes first.`;

export type FoundingProvision = {
  /** Stable key, so a surface can style or filter one without matching prose. */
  id: string;
  title: string;
  detail: string;
  /** True where the provision is limited to part of the cohort. */
  limited?: boolean;
};

export const FOUNDING_PROVISIONS: readonly FoundingProvision[] = [
  {
    id: "price",
    title: "The founding price, kept for good",
    detail:
      "Plus for $69 instead of $89, Complete for $139 instead of $169. One " +
      "payment, and access for the life of the product.",
  },
  {
    id: "workbook",
    title: "The legacy workbook",
    detail:
      "A founding edition of the Pravely workbook, alongside the Essentials " +
      "workbook included with every account.",
  },
  {
    id: "badge",
    title: "A founders badge on your profile",
    detail:
      "A permanent mark on your Pravely profile showing you were here at the " +
      "start.",
  },
  {
    id: "certificate",
    title: "A numbered founders certificate",
    detail:
      `Your place in the cohort, recorded and shown beside your badge — ` +
      `Founder #12 of ${seatLimit}. Numbers are issued in the order people buy.`,
  },
  {
    id: "letter",
    title: "A personal welcome letter",
    detail:
      "Written to you, not generated for a list. It explains what Pravely is " +
      "for, what is coming, and how to reach a person about it.",
  },
  {
    id: "roadmap",
    title: "A vote on the roadmap",
    detail:
      "Founders can vote on the roadmap and receive early testing " +
      "invitations. Votes inform prioritization but do not guarantee that a " +
      "feature will be built.",
  },
  {
    id: "support",
    title: "Priority support",
    /**
     * Deliberately a promise about order, not about elapsed time.
     *
     * "Answered within a day" is a commitment that breaks the first time Justin
     * is asleep, travelling or on duty, and a founding provision that quietly
     * stops being true is worse than one never offered. Going first is
     * something that can always be honoured.
     */
    detail:
      "Your messages go to the front of the queue. Founders are answered " +
      "before other support requests, for as long as you use Pravely.",
  },
] as const;

/** Where founders vote and where early testing invitations go out. */
export const FOUNDING_COMMUNITY_NOTE =
  "Roadmap voting and early testing invitations run in the founders channel, " +
  "and the invitation arrives with your welcome letter.";
