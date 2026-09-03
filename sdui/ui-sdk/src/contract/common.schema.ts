import { z } from 'zod';

export const idSchema = z.string().trim().min(1);
export const typeSchema = z.string().trim().min(1);

export const propertiesSchema = z.record(z.string(), z.unknown());

export const actionSchema = z.object({
  type: typeSchema,
  targetId: idSchema.optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
}).strict();

export const actionsSchema = z.record(z.string().min(1), actionSchema);

export const targetAppSchema = z.enum(['GLOBAL', 'CUSTOMER', 'PARTNER']);

export type SduiAction = z.infer<typeof actionSchema>;
export type SduiTargetApp = z.infer<typeof targetAppSchema>;
