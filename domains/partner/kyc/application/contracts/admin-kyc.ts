/**
 * Transport-neutral application input contracts derived from admin-kyc.dto.ts.
 * Zod remains at the API boundary; bounded-context application services depend only on these types.
 */
export type ReviewKycDocumentDto = { status: any; rejectionReason?: string | undefined; };
