import { z } from 'zod';
import { orientationSchema, colorSchema, dimensionSchema } from '../../../properties/index.js';

export const dividerPropertiesSchema = z.object({
  semanticRole: z.literal('divider').optional(),
  orientation: orientationSchema.optional(),
  width: dimensionSchema.optional(),
  height: dimensionSchema.optional(),
  thickness: z.number().finite().nonnegative().optional(),
  color: colorSchema.optional(),
}).strict();

export type DividerProperties = z.infer<typeof dividerPropertiesSchema>;
