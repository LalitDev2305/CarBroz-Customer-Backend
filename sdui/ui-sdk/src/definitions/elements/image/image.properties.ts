import { z } from 'zod';
import { dimensionSchema } from '../../../properties/index.js';

export const imagePropertiesSchema = z.object({
  semanticRole: z.literal('image').optional(),
  url: z.string().trim().min(1),
  width: dimensionSchema.optional(),
  height: dimensionSchema.optional(),
  minWidth: dimensionSchema.optional(),
  minHeight: dimensionSchema.optional(),
  maxWidth: dimensionSchema.optional(),
  maxHeight: dimensionSchema.optional(),
  fillMaxWidth: z.boolean().optional(),
  fillMaxHeight: z.boolean().optional(),
  contentScale: z.enum(['fit', 'crop', 'fillBounds', 'inside']).optional(),
}).strict();

export type ImageProperties = z.infer<typeof imagePropertiesSchema>;
