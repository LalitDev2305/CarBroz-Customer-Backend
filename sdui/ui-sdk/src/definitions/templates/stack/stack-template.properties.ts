import { z } from 'zod';
import { orientationSchema, arrangementSchema, horizontalAlignmentSchema, verticalAlignmentSchema, edgeInsetsSchema, dimensionSchema, backgroundSchema, borderSchema, shapeSchema } from '../../../properties/index.js';

export const stackTemplatePropertiesSchema = z.object({
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
  fillMaxWidth: z.boolean().optional(),
  fillMaxHeight: z.boolean().optional(),
  fillMaxSize: z.boolean().optional(),
  background: backgroundSchema.optional(),
  border: borderSchema.optional(),
  shape: shapeSchema.optional(),
}).strict();

export type StackTemplateProperties = z.infer<typeof stackTemplatePropertiesSchema>;
