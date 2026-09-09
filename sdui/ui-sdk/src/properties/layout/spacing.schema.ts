import { z } from 'zod';

export const spacingValueSchema = z.number().finite().nonnegative();
export const edgeInsetsSchema = z.object({
  start: spacingValueSchema.optional(),
  top: spacingValueSchema.optional(),
  end: spacingValueSchema.optional(),
  bottom: spacingValueSchema.optional(),
}).strict();

export type SpacingValue = z.infer<typeof spacingValueSchema>;
export type EdgeInsets = z.infer<typeof edgeInsetsSchema>;
