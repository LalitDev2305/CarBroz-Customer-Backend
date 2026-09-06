/**
 * Transport-neutral application input contracts derived from payout.dto.ts.
 * Zod remains at the API boundary; bounded-context application services depend only on these types.
 */
export type MarkPayoutPaidDto = { externalReference: string; };
