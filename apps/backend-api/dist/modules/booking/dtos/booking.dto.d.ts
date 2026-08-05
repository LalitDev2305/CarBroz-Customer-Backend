import { z } from 'zod';
export declare const createBookingSchema: z.ZodObject<{
    vehicleId: z.ZodNumber;
    addressId: z.ZodNumber;
    serviceId: z.ZodNumber;
    addonIds: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
    slotStartTime: z.ZodString;
    slotEndTime: z.ZodString;
}, z.core.$strip>;
export type CreateBookingDto = z.infer<typeof createBookingSchema>;
export declare const assignPartnerSchema: z.ZodObject<{
    partnerId: z.ZodNumber;
}, z.core.$strip>;
export type AssignPartnerDto = z.infer<typeof assignPartnerSchema>;
export declare const cancelBookingSchema: z.ZodObject<{
    reason: z.ZodString;
}, z.core.$strip>;
export type CancelBookingDto = z.infer<typeof cancelBookingSchema>;
export declare const transitionStatusSchema: z.ZodObject<{
    targetStatus: z.ZodEnum<{
        IN_PROGRESS: "IN_PROGRESS";
        COMPLETED: "COMPLETED";
    }>;
}, z.core.$strip>;
export type TransitionStatusDto = z.infer<typeof transitionStatusSchema>;
