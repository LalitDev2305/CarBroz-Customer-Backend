import { z } from 'zod';
import { stackGroupPropertiesSchema } from '../stack/stack-group.properties.js';

export const rowGroupPropertiesSchema = stackGroupPropertiesSchema.extend({
  axis: z.literal('horizontal').optional(),
}).strict();
export type RowGroupProperties = z.infer<typeof rowGroupPropertiesSchema>;
