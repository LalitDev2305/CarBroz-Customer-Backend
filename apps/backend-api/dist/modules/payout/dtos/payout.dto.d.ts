import { z } from 'zod';
export declare const markPayoutPaidSchema: z.ZodObject<{
    externalReference: z.ZodString;
}, z.core.$strip>;
export type MarkPayoutPaidDto = z.infer<typeof markPayoutPaidSchema>;
