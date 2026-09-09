import { z } from 'zod';

export const roundedCornerShapeSchema = z.object({
  type: z.literal('roundedCorner'),
  cornerRadius: z.number().finite().nonnegative(),
}).strict();
export const shapeSchema = roundedCornerShapeSchema;

export type Shape = z.infer<typeof shapeSchema>;
