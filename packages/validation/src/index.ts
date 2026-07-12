import { z } from 'zod';

export const uuidSchema = z.string().uuid();
export const emailSchema = z.string().email().transform((str) => str.toLowerCase());
export const phoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format');

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const dateSchema = z.coerce.date();

export const passwordSchema = z.string().min(8).max(100);

export const createEnumSchema = <T extends [string, ...string[]]>(values: T) => z.enum(values);
