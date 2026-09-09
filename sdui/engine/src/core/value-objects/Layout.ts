import { z } from 'zod';
import { backgroundSchema, borderSchema, shapeSchema } from './Appearance.js';

export const orientationSchema = z.enum(['vertical', 'horizontal']);

export const spacingValueSchema = z.number().finite().nonnegative();
export const edgeInsetsSchema = z.object({
  start: spacingValueSchema.optional(),
  top: spacingValueSchema.optional(),
  end: spacingValueSchema.optional(),
  bottom: spacingValueSchema.optional(),
}).strict();

export const arrangementKeywordSchema = z.enum([
  'start',
  'center',
  'end',
  'spaceBetween',
  'spaceAround',
  'spaceEvenly',
]);
export const spacedByArrangementSchema = z.object({
  type: z.literal('spacedBy'),
  spacing: spacingValueSchema,
}).strict();
export const arrangementSchema = z.union([
  arrangementKeywordSchema,
  spacedByArrangementSchema,
]);

export const horizontalAlignmentSchema = z.enum(['start', 'center', 'end', 'stretch']);
export const verticalAlignmentSchema = z.enum(['top', 'center', 'bottom', 'stretch']);
export const textAlignmentSchema = z.enum(['start', 'center', 'end', 'justify']);

export const dimensionSchema = z.number().finite().nonnegative();
export const weightSchema = z.number().finite().positive();

/** Shared field shape only. Concrete node definitions own their final strict schema. */
export const containerPropertyShape = {
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
} as const;

export type Orientation = z.infer<typeof orientationSchema>;
export type EdgeInsets = z.infer<typeof edgeInsetsSchema>;
export type Arrangement = z.infer<typeof arrangementSchema>;
export type HorizontalAlignment = z.infer<typeof horizontalAlignmentSchema>;
export type VerticalAlignment = z.infer<typeof verticalAlignmentSchema>;
export type TextAlignment = z.infer<typeof textAlignmentSchema>;
