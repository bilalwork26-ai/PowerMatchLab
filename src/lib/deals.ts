/**
 * Deals infrastructure.
 *
 * The data model exists so verified deals can be added later. V1 ships ZERO
 * deals. We never render invented crossed-out prices, percentages, countdowns,
 * urgency or stock warnings.
 */

export interface Deal {
  productId: string;
  /** What is actually verified about this deal. */
  summary: string;
  /** ISO date the deal was confirmed against the retailer. */
  verifiedOn: string;
  /** Optional ISO date the deal is known to end. Never invented. */
  endsOn?: string;
  /** The retailer URL the deal was seen on. */
  sourceUrl: string;
}

/** Intentionally empty in V1. */
export const DEALS: Deal[] = [];

export function getActiveDeals(now: Date = new Date()): Deal[] {
  return DEALS.filter((d) => !d.endsOn || new Date(d.endsOn) >= now);
}
