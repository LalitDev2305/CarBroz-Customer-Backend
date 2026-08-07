import { z } from 'zod';
export declare const geocodeSchema: z.ZodObject<{
    address: z.ZodString;
}, z.core.$strip>;
export type GeocodeRequestDto = z.infer<typeof geocodeSchema>;
export declare const reverseGeocodeSchema: z.ZodObject<{
    lat: z.ZodCoercedNumber<unknown>;
    lng: z.ZodCoercedNumber<unknown>;
}, z.core.$strip>;
export type ReverseGeocodeRequestDto = z.infer<typeof reverseGeocodeSchema>;
export declare const calculateDistanceSchema: z.ZodObject<{
    originLat: z.ZodCoercedNumber<unknown>;
    originLng: z.ZodCoercedNumber<unknown>;
    destLat: z.ZodCoercedNumber<unknown>;
    destLng: z.ZodCoercedNumber<unknown>;
}, z.core.$strip>;
export type CalculateDistanceRequestDto = z.infer<typeof calculateDistanceSchema>;
