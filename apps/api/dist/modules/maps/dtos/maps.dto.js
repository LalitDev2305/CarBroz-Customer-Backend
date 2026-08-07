import { z } from 'zod';
export const geocodeSchema = z.object({
    address: z.string().min(1, 'Address is required')
});
export const reverseGeocodeSchema = z.object({
    lat: z.coerce.number().min(-90).max(90),
    lng: z.coerce.number().min(-180).max(180)
});
export const calculateDistanceSchema = z.object({
    originLat: z.coerce.number().min(-90).max(90),
    originLng: z.coerce.number().min(-180).max(180),
    destLat: z.coerce.number().min(-90).max(90),
    destLng: z.coerce.number().min(-180).max(180)
});
//# sourceMappingURL=maps.dto.js.map