import { z } from 'zod';

export const colorSchema = z.string().trim().min(1);

export const gradientColorStopSchema = z.object({
  color: colorSchema,
  stop: z.number().finite().min(0).max(1),
}).strict();

export const solidBackgroundSchema = z.object({
  color: colorSchema,
}).strict();

export const linearGradientBackgroundSchema = z.object({
  type: z.literal('linearGradient'),
  angle: z.number().finite().optional(),
  colors: z.array(gradientColorStopSchema).min(2),
}).strict();

export const backgroundSchema = z.union([
  solidBackgroundSchema,
  linearGradientBackgroundSchema,
]);

export const borderSchema = z.object({
  width: z.number().finite().nonnegative(),
  color: colorSchema,
}).strict();

export const shapeSchema = z.object({
  type: z.literal('roundedCorner'),
  cornerRadius: z.number().finite().nonnegative(),
}).strict();

export type ColorValue = z.infer<typeof colorSchema>;
export type Background = z.infer<typeof backgroundSchema>;
export type Border = z.infer<typeof borderSchema>;
export type Shape = z.infer<typeof shapeSchema>;
