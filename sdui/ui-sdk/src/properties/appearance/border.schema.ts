import { z } from 'zod';
import { colorSchema } from './color.schema.js';

export const borderSchema = z.object({
  width: z.number().finite().nonnegative(),
  color: colorSchema,
}).strict();

export type Border = z.infer<typeof borderSchema>;
