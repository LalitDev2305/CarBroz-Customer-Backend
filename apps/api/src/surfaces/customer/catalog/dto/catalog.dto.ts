import { z } from 'zod';

export const calculatePriceSchema = z.object({
  serviceId: z.number().int().positive(),
  vehicleType: z.string().min(1),
  addonIds: z.array(z.number().int().positive()).optional().default([]),
});
