import { z } from 'zod';

export const orientationSchema = z.enum(['vertical', 'horizontal']);
export type Orientation = z.infer<typeof orientationSchema>;
