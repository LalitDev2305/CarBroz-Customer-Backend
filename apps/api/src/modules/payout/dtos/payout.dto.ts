import { z } from 'zod';

export const markPayoutPaidSchema = z.object({
  externalReference: z.string().min(1, 'External reference (bank reference / UTR) is required'),
});

export type MarkPayoutPaidDto = z.infer<typeof markPayoutPaidSchema>;
