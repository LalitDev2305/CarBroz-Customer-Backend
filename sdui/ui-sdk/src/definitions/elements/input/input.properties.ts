import { z } from 'zod';
import { backgroundSchema, borderSchema, shapeSchema, textAlignmentSchema, dimensionSchema, weightSchema } from '../../../properties/index.js';

export const inputPropertiesSchema = z.object({
  semanticRole: z.literal('input').optional(),
  placeholder: z.string().optional(),
  keyboardType: z.enum(['text', 'phone', 'number', 'email', 'password']).optional(),
  maxLength: z.number().int().positive().optional(),
  width: dimensionSchema.optional(),
  height: dimensionSchema.optional(),
  weight: weightSchema.optional(),
  fillMaxWidth: z.boolean().optional(),
  textAlign: textAlignmentSchema.optional(),
  background: backgroundSchema.optional(),
  border: borderSchema.optional(),
  shape: shapeSchema.optional(),
}).strict();

export type InputProperties = z.infer<typeof inputPropertiesSchema>;
