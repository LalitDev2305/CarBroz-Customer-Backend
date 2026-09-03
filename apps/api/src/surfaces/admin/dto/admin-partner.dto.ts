import { z } from 'zod';

export const verifyPartnerSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED', 'REJECTED']),
});

export type VerifyPartnerDto = z.infer<typeof verifyPartnerSchema>;
