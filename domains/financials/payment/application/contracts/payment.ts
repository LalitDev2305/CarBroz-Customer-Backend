/**
 * Transport-neutral application input contracts derived from payment.dto.ts.
 * Zod remains at the API boundary; bounded-context application services depend only on these types.
 */
export type CreateCheckoutDto = { bookingPublicId: string; };
