import { z } from 'zod';

export const geocodeSchema = z.object({
  address: z.string().min(1, 'Address is required')
});

/** GeocodeRequestDto is an exported apps/api contract/implementation; see the owning README for lifecycle and extension rules. */
export type GeocodeRequestDto = z.infer<typeof geocodeSchema>;

export const reverseGeocodeSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180)
});

/** ReverseGeocodeRequestDto is an exported apps/api contract/implementation; see the owning README for lifecycle and extension rules. */
export type ReverseGeocodeRequestDto = z.infer<typeof reverseGeocodeSchema>;

export const calculateDistanceSchema = z.object({
  originLat: z.coerce.number().min(-90).max(90),
  originLng: z.coerce.number().min(-180).max(180),
  destLat: z.coerce.number().min(-90).max(90),
  destLng: z.coerce.number().min(-180).max(180)
});

/** CalculateDistanceRequestDto is an exported apps/api contract/implementation; see the owning README for lifecycle and extension rules. */
export type CalculateDistanceRequestDto = z.infer<typeof calculateDistanceSchema>;
