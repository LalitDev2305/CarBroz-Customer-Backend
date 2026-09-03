import { z } from 'zod';

export const calculatePriceSchema = z.object({
  serviceId: z.number().int().positive(),
  vehicleType: z.string().min(1), // e.g. "HATCHBACK", "SEDAN", "SUV", "LUXURY"
  addonIds: z.array(z.number().int().positive()).optional().default([]),
});

export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  iconUrl: z.string().url().optional(),
  sortOrder: z.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export const createServiceSchema = z.object({
  categoryId: z.number().int().positive(),
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  imageUrl: z.string().url().optional(),
  basePrice: z.number().int().nonnegative(), // Price in cents
  estimatedDurationMinutes: z.number().int().positive().optional().default(60),
  isActive: z.boolean().optional().default(true),
});

export const createAddonSchema = z.object({
  serviceId: z.number().int().positive(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  price: z.number().int().nonnegative(), // Price in cents
  isActive: z.boolean().optional().default(true),
});

export const createPricingTierSchema = z.object({
  serviceId: z.number().int().positive(),
  name: z.string().min(1).max(100),
  flatPrice: z.number().int().nonnegative(),
  isDefault: z.boolean().optional().default(false),
});

export const setVehicleMultiplierSchema = z.object({
  serviceId: z.number().int().positive(),
  vehicleType: z.string().min(1),
  multiplier: z.number().positive(),
});
