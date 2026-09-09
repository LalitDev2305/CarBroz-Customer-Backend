import { z } from 'zod';

export const colorSchema = z.string().trim().min(1);
export const gradientColorStopSchema = z.object({
  color: colorSchema,
  stop: z.number().finite().min(0).max(1),
}).strict();

export type ColorValue = z.infer<typeof colorSchema>;
export type GradientColorStop = z.infer<typeof gradientColorStopSchema>;
