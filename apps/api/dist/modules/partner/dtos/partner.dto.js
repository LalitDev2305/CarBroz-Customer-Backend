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
//# sourceMappingURL=partner.dto.js.map