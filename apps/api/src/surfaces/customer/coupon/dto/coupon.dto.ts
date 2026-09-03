import { z } from 'zod';

export const validateCouponSchema = z.object({
  code: z.string().min(1),
  bookingAmountPaise: z.number().int().positive(),
});

export const applyCouponSchema = z.object({
  code: z.string().min(1),
  bookingPublicId: z.string().uuid(),
});

export type ValidateCouponDto = z.infer<typeof validateCouponSchema>;
export type ApplyCouponDto = z.infer<typeof applyCouponSchema>;
