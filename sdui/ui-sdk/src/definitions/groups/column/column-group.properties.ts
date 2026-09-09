import { z } from 'zod';
import { stackGroupPropertiesSchema } from '../stack/stack-group.properties.js';

export const columnGroupPropertiesSchema = stackGroupPropertiesSchema.extend({
  axis: z.literal('vertical').optional(),
}).strict();
export type ColumnGroupProperties = z.infer<typeof columnGroupPropertiesSchema>;
