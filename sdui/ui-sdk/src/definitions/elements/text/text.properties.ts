import { z } from 'zod';
import { colorSchema, textAlignmentSchema, dimensionSchema, weightSchema, accessoriesSchema } from '../../../properties/index.js';

export const textPropertiesSchema = z.object({
  semanticRole: z.literal('text').optional(),
  text: z.string(),
  fontSize: z.number().finite().positive().optional(),
  fontWeight: z.number().int().min(100).max(900).optional(),
  lineHeight: z.number().finite().positive().optional(),
  letterSpacing: z.number().finite().optional(),
  color: colorSchema.optional(),
  textAlign: textAlignmentSchema.optional(),
  width: dimensionSchema.optional(),
  height: dimensionSchema.optional(),
  maxWidth: dimensionSchema.optional(),
  weight: weightSchema.optional(),
  fillMaxWidth: z.boolean().optional(),
  leading: accessoriesSchema.optional(),
  trailing: accessoriesSchema.optional(),
}).strict();

export type TextProperties = z.infer<typeof textPropertiesSchema>;
