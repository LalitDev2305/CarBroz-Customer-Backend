import { z } from 'zod';
export const startTrackingSchema = z.object({
    bookingPublicId: z.string().uuid(),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    heading: z.number().optional(),
    speed: z.number().optional(),
});
export const updateLocationPingSchema = z.object({
    bookingPublicId: z.string().uuid(),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    heading: z.number().optional(),
    speed: z.number().optional(),
});
export const endTrackingSchema = z.object({
    bookingPublicId: z.string().uuid(),
});
//# sourceMappingURL=tracking.dto.js.map