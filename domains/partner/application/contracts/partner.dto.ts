/**
 * Transport-neutral application input contracts derived from partner.dto.ts.
 * Zod remains at the API boundary; bounded-context application services depend only on these types.
 */
export type RegisterIndividualPartnerDto = { businessName: string; };
/** RegisterOrganizationPartnerDto is an exported domains/partner contract/implementation; see the owning README for lifecycle and extension rules. */
export type RegisterOrganizationPartnerDto = { businessName: string; };
/** VerifyPartnerDto is an exported domains/partner contract/implementation; see the owning README for lifecycle and extension rules. */
export type VerifyPartnerDto = { status: "ACTIVE" | "SUSPENDED" | "REJECTED"; };
