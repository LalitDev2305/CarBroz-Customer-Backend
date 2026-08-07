import { z } from 'zod';
export declare const calculatePriceSchema: z.ZodObject<{
    serviceId: z.ZodNumber;
    vehicleType: z.ZodString;
    addonIds: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodNumber>>>;
}, z.core.$strip>;
export declare const createCategorySchema: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    iconUrl: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    isActive: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>;
export declare const createServiceSchema: z.ZodObject<{
    categoryId: z.ZodNumber;
    name: z.ZodString;
    slug: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    imageUrl: z.ZodOptional<z.ZodString>;
    basePrice: z.ZodNumber;
    estimatedDurationMinutes: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    isActive: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>;
export declare const createAddonSchema: z.ZodObject<{
    serviceId: z.ZodNumber;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    price: z.ZodNumber;
    isActive: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>;
export declare const createPricingTierSchema: z.ZodObject<{
    serviceId: z.ZodNumber;
    name: z.ZodString;
    flatPrice: z.ZodNumber;
    isDefault: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>;
export declare const setVehicleMultiplierSchema: z.ZodObject<{
    serviceId: z.ZodNumber;
    vehicleType: z.ZodString;
    multiplier: z.ZodNumber;
}, z.core.$strip>;
