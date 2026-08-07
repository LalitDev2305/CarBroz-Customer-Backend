import { z } from 'zod';
export declare const registerIndividualPartnerSchema: z.ZodObject<{
    businessName: z.ZodString;
}, z.core.$strip>;
export declare const registerOrganizationPartnerSchema: z.ZodObject<{
    businessName: z.ZodString;
}, z.core.$strip>;
export declare const verifyPartnerSchema: z.ZodObject<{
    status: z.ZodEnum<{
        ACTIVE: "ACTIVE";
        SUSPENDED: "SUSPENDED";
        REJECTED: "REJECTED";
    }>;
}, z.core.$strip>;
export type RegisterIndividualPartnerDto = z.infer<typeof registerIndividualPartnerSchema>;
export type RegisterOrganizationPartnerDto = z.infer<typeof registerOrganizationPartnerSchema>;
export type VerifyPartnerDto = z.infer<typeof verifyPartnerSchema>;
