import { z } from 'zod';
export declare const createCheckoutSchema: z.ZodObject<{
    bookingPublicId: z.ZodString;
}, z.core.$strip>;
export type CreateCheckoutDto = z.infer<typeof createCheckoutSchema>;
