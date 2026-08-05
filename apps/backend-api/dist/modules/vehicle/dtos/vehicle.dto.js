import { z } from 'zod';
export const createVehicleSchema = z.object({
    make: z.string().min(1, 'Make is required'),
    model: z.string().min(1, 'Model is required'),
    variant: z.string().optional(),
    year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
    registrationNumber: z.string().min(1, 'Registration number is required'),
    fuelType: z.string().min(1, 'Fuel type is required'),
    color: z.string().optional(),
    nickname: z.string().optional(),
    isDefault: z.boolean().optional(),
});
//# sourceMappingURL=vehicle.dto.js.map