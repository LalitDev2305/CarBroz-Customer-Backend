import { z } from 'zod';

export const createAdminCouponSchema = z.object({
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

export const updateAdminCouponSchema = z.object({
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
