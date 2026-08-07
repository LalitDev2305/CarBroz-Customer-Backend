import { z } from 'zod';
export declare const createCouponSchema: z.ZodObject<{
    code: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    discountType: z.ZodEnum<{
        PERCENTAGE: "PERCENTAGE";
        FIXED_AMOUNT: "FIXED_AMOUNT";
    }>;
    discountValue: z.ZodNumber;
    maxDiscountPaise: z.ZodOptional<z.ZodNumber>;
    minBookingAmountPaise: z.ZodOptional<z.ZodNumber>;
    usageLimit: z.ZodOptional<z.ZodNumber>;
    perUserLimit: z.ZodOptional<z.ZodNumber>;
    validFrom: z.ZodString;
    validUntil: z.ZodString;
}, z.core.$strip>;
export declare const updateCouponSchema: z.ZodObject<{
    description: z.ZodOptional<z.ZodString>;
    discountType: z.ZodOptional<z.ZodEnum<{
        PERCENTAGE: "PERCENTAGE";
        FIXED_AMOUNT: "FIXED_AMOUNT";
    }>>;
    discountValue: z.ZodOptional<z.ZodNumber>;
    maxDiscountPaise: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    minBookingAmountPaise: z.ZodOptional<z.ZodNumber>;
    usageLimit: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    perUserLimit: z.ZodOptional<z.ZodNumber>;
    validFrom: z.ZodOptional<z.ZodString>;
    validUntil: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const validateCouponSchema: z.ZodObject<{
    code: z.ZodString;
    bookingAmountPaise: z.ZodNumber;
}, z.core.$strip>;
export declare const applyCouponSchema: z.ZodObject<{
    code: z.ZodString;
    bookingPublicId: z.ZodString;
}, z.core.$strip>;
export type CreateCouponDto = z.infer<typeof createCouponSchema>;
export type UpdateCouponDto = z.infer<typeof updateCouponSchema>;
export type ValidateCouponDto = z.infer<typeof validateCouponSchema>;
export type ApplyCouponDto = z.infer<typeof applyCouponSchema>;
