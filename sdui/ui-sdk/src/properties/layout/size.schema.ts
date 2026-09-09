import { z } from 'zod';

export const dimensionSchema = z.number().finite().nonnegative();
export const weightSchema = z.number().finite().positive();
export const sizePropertiesSchema = z.object({
  width: dimensionSchema.optional(),
  height: dimensionSchema.optional(),
  minWidth: dimensionSchema.optional(),
  minHeight: dimensionSchema.optional(),
  maxWidth: dimensionSchema.optional(),
  maxHeight: dimensionSchema.optional(),
  weight: weightSchema.optional(),
  fillMaxWidth: z.boolean().optional(),
  fillMaxHeight: z.boolean().optional(),
  fillMaxSize: z.boolean().optional(),
}).strict();
export type SizeProperties = z.infer<typeof sizePropertiesSchema>;
