import { z } from 'zod';

export const createCouponSchema = z.object({
  code: z.string().min(2).max(20),
  description: z.string().optional(),
  discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
  discountValue: z.number().int().positive(),
  maxDiscountPaise: z.number().int().positive().optional(),
  minBookingAmountPaise: z.number().int().nonnegative().optional(),
  usageLimit: z.number().int().positive().optional(),
  perUserLimit: z.number().int().positive().optional(),
  validFrom: z.string().datetime(),
  validUntil: z.string().datetime(),
});

export const updateCouponSchema = z.object({
  description: z.string().optional(),
  discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']).optional(),
  discountValue: z.number().int().positive().optional(),
  maxDiscountPaise: z.number().int().positive().nullable().optional(),
  minBookingAmountPaise: z.number().int().nonnegative().optional(),
  usageLimit: z.number().int().positive().nullable().optional(),
  perUserLimit: z.number().int().positive().optional(),
  validFrom: z.string().datetime().optional(),
  validUntil: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
});

export const validateCouponSchema = z.object({
  code: z.string().min(1),
  bookingAmountPaise: z.number().int().positive(),
});

export const applyCouponSchema = z.object({
  code: z.string().min(1),
  bookingPublicId: z.string().uuid(),
});

export type CreateCouponDto = z.infer<typeof createCouponSchema>;
export type UpdateCouponDto = z.infer<typeof updateCouponSchema>;
export type ValidateCouponDto = z.infer<typeof validateCouponSchema>;
export type ApplyCouponDto = z.infer<typeof applyCouponSchema>;
