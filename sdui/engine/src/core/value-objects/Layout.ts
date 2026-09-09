import { z } from 'zod';

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

export type Orientation = z.infer<typeof orientationSchema>;
export type EdgeInsets = z.infer<typeof edgeInsetsSchema>;
export type Arrangement = z.infer<typeof arrangementSchema>;
export type HorizontalAlignment = z.infer<typeof horizontalAlignmentSchema>;
export type VerticalAlignment = z.infer<typeof verticalAlignmentSchema>;
export type TextAlignment = z.infer<typeof textAlignmentSchema>;
