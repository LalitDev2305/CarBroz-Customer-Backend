import { z } from 'zod';

export const accessorySchema = z.object({
  type: z.string().trim().min(1),
  properties: z.record(z.string(), z.unknown()),
}).strict();
export const accessoriesSchema = z.array(accessorySchema);

export type Accessory = z.infer<typeof accessorySchema>;
