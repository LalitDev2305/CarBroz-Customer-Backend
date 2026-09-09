import { z } from 'zod';
import { orientationSchema, arrangementSchema, horizontalAlignmentSchema, verticalAlignmentSchema, edgeInsetsSchema, dimensionSchema, weightSchema, backgroundSchema, borderSchema, shapeSchema } from '../../../properties/index.js';

export const stackComponentPropertiesSchema = z.object({
  orientation: orientationSchema.optional(),
  verticalArrangement: arrangementSchema.optional(),
  horizontalArrangement: arrangementSchema.optional(),
  horizontalAlignment: horizontalAlignmentSchema.optional(),
  verticalAlignment: verticalAlignmentSchema.optional(),
  padding: edgeInsetsSchema.optional(),
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
  background: backgroundSchema.optional(),
  border: borderSchema.optional(),
  shape: shapeSchema.optional(),
}).strict();

export type StackComponentProperties = z.infer<typeof stackComponentPropertiesSchema>;
