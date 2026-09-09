import { z } from 'zod';
import { dimensionSchema, weightSchema } from '../../../properties/index.js';

export const spacerPropertiesSchema = z.object({
  semanticRole: z.literal('spacing').optional(),
  width: dimensionSchema.optional(),
  height: dimensionSchema.optional(),
  weight: weightSchema.optional(),
}).strict();

export type SpacerProperties = z.infer<typeof spacerPropertiesSchema>;
