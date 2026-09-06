import { z } from 'zod';

export const registerIndividualPartnerSchema = z.object({
  businessName: z.string().min(2, "Business name must be at least 2 characters").max(100),
});

export const registerOrganizationPartnerSchema = z.object({
  businessName: z.string().min(2, "Business name must be at least 2 characters").max(100),
});

export const verifyPartnerSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED', 'REJECTED']),
});

/** RegisterIndividualPartnerDto is an exported apps/api contract/implementation; see the owning README for lifecycle and extension rules. */
export type RegisterIndividualPartnerDto = z.infer<typeof registerIndividualPartnerSchema>;
/** RegisterOrganizationPartnerDto is an exported apps/api contract/implementation; see the owning README for lifecycle and extension rules. */
export type RegisterOrganizationPartnerDto = z.infer<typeof registerOrganizationPartnerSchema>;
/** VerifyPartnerDto is an exported apps/api contract/implementation; see the owning README for lifecycle and extension rules. */
export type VerifyPartnerDto = z.infer<typeof verifyPartnerSchema>;
