import { z } from 'zod';
import { colorSchema, dimensionSchema } from '../../../properties/index.js';

export const iconPropertiesSchema = z.object({
  semanticRole: z.literal('icon').optional(),
  name: z.string().trim().min(1),
  size: dimensionSchema.optional(),
  color: colorSchema.optional(),
}).strict();

export type IconProperties = z.infer<typeof iconPropertiesSchema>;
