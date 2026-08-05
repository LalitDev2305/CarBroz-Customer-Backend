import { z } from 'zod';

export const createBookingSchema = z.object({
  vehicleId: z.number().int().positive(),
  addressId: z.number().int().positive(),
  serviceId: z.number().int().positive(),
  addonIds: z.array(z.number().int().positive()).optional(),
  slotStartTime: z.string().datetime(),
  slotEndTime: z.string().datetime(),
});

export type CreateBookingDto = z.infer<typeof createBookingSchema>;

export const assignPartnerSchema = z.object({
  partnerId: z.number().int().positive(),
});

export type AssignPartnerDto = z.infer<typeof assignPartnerSchema>;

export const cancelBookingSchema = z.object({
  reason: z.string().min(1, 'Cancellation reason is required'),
});

export type CancelBookingDto = z.infer<typeof cancelBookingSchema>;

export const transitionStatusSchema = z.object({
  targetStatus: z.enum(['IN_PROGRESS', 'COMPLETED']),
});

export type TransitionStatusDto = z.infer<typeof transitionStatusSchema>;
