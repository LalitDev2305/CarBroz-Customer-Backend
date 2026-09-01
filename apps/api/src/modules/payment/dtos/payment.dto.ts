import { z } from 'zod';

export const createCheckoutSchema = z.object({
  bookingPublicId: z.string().min(1, 'Booking public ID is required'),
});

export type CreateCheckoutDto = z.infer<typeof createCheckoutSchema>;
