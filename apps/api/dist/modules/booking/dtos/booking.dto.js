import { z } from 'zod';
export const createBookingSchema = z.object({
    vehicleId: z.number().int().positive(),
    addressId: z.number().int().positive(),
    serviceId: z.number().int().positive(),
    addonIds: z.array(z.number().int().positive()).optional(),
    slotStartTime: z.string().datetime(),
    slotEndTime: z.string().datetime(),
});
export const assignPartnerSchema = z.object({
    partnerId: z.number().int().positive(),
});
export const cancelBookingSchema = z.object({
    reason: z.string().min(1, 'Cancellation reason is required'),
});
export const transitionStatusSchema = z.object({
    targetStatus: z.enum(['IN_PROGRESS', 'COMPLETED']),
});
//# sourceMappingURL=booking.dto.js.map