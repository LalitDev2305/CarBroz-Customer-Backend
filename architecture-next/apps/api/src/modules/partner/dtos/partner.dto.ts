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

export type RegisterIndividualPartnerDto = z.infer<typeof registerIndividualPartnerSchema>;
export type RegisterOrganizationPartnerDto = z.infer<typeof registerOrganizationPartnerSchema>;
export type VerifyPartnerDto = z.infer<typeof verifyPartnerSchema>;
