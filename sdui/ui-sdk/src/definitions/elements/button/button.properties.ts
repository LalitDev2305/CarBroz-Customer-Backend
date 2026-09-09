import { z } from 'zod';
import { backgroundSchema, shapeSchema, colorSchema, dimensionSchema, accessoriesSchema } from '../../../properties/index.js';

export const buttonPropertiesSchema = z.object({
  semanticRole: z.literal('action').optional(),
  text: z.string(),
  width: dimensionSchema.optional(),
  height: dimensionSchema.optional(),
  fillMaxWidth: z.boolean().optional(),
  fontSize: z.number().finite().positive().optional(),
  fontWeight: z.number().int().min(100).max(900).optional(),
  textColor: colorSchema.optional(),
  background: backgroundSchema.optional(),
  shape: shapeSchema.optional(),
  leading: accessoriesSchema.optional(),
  trailing: accessoriesSchema.optional(),
}).strict();

export type ButtonProperties = z.infer<typeof buttonPropertiesSchema>;
