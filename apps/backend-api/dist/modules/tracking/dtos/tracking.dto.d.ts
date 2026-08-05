import { z } from 'zod';
export declare const startTrackingSchema: z.ZodObject<{
    bookingPublicId: z.ZodString;
    latitude: z.ZodNumber;
    longitude: z.ZodNumber;
    heading: z.ZodOptional<z.ZodNumber>;
    speed: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const updateLocationPingSchema: z.ZodObject<{
    bookingPublicId: z.ZodString;
    latitude: z.ZodNumber;
    longitude: z.ZodNumber;
    heading: z.ZodOptional<z.ZodNumber>;
    speed: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const endTrackingSchema: z.ZodObject<{
    bookingPublicId: z.ZodString;
}, z.core.$strip>;
export type StartTrackingDto = z.infer<typeof startTrackingSchema>;
export type UpdateLocationPingDto = z.infer<typeof updateLocationPingSchema>;
export type EndTrackingDto = z.infer<typeof endTrackingSchema>;
