import { z } from 'zod';
export declare const createVehicleSchema: z.ZodObject<{
    make: z.ZodString;
    model: z.ZodString;
    variant: z.ZodOptional<z.ZodString>;
    year: z.ZodNumber;
    registrationNumber: z.ZodString;
    fuelType: z.ZodString;
    color: z.ZodOptional<z.ZodString>;
    nickname: z.ZodOptional<z.ZodString>;
    isDefault: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export type CreateVehicleDto = z.infer<typeof createVehicleSchema>;
