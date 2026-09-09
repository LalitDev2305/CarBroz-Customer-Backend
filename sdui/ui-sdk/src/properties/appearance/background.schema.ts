import { z } from 'zod';
import { colorSchema, gradientColorStopSchema } from './color.schema.js';

export const solidBackgroundSchema = z.object({ color: colorSchema }).strict();
export const linearGradientBackgroundSchema = z.object({
  type: z.literal('linearGradient'),
  angle: z.number().finite().optional(),
  colors: z.array(gradientColorStopSchema).min(2),
}).strict();
export const backgroundSchema = z.union([solidBackgroundSchema, linearGradientBackgroundSchema]);

export type Background = z.infer<typeof backgroundSchema>;
