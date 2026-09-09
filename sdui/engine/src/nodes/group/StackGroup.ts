import { z } from 'zod';
import type { NodeDefinition } from '../../core/NodeDefinition.js';
import { containerPropertyShape, weightSchema } from '../../core/value-objects/Layout.js';

export const STACK_GROUP = 'stack_group';

export const stackGroupPropertiesSchema = z.object({
  ...containerPropertyShape,
  weight: weightSchema.optional(),
}).strict();

export type StackGroupProperties = z.infer<typeof stackGroupPropertiesSchema>;

export const StackGroupDefinition: NodeDefinition<StackGroupProperties> = {
  type: STACK_GROUP,
  level: 'group',
  defaults: { orientation: 'vertical' },
  properties: stackGroupPropertiesSchema,
  children: 'elements',
};
