import { z } from 'zod';
import type { NodeDefinition } from '../../core/NodeDefinition.js';
import { containerPropertyShape, weightSchema } from '../../core/value-objects/Layout.js';

export const STACK_COMPONENT = 'stack_component';

export const stackComponentPropertiesSchema = z.object({
  ...containerPropertyShape,
  weight: weightSchema.optional(),
}).strict();

export type StackComponentProperties = z.infer<typeof stackComponentPropertiesSchema>;

export const StackComponentDefinition: NodeDefinition<StackComponentProperties> = {
  type: STACK_COMPONENT,
  level: 'component',
  defaults: { orientation: 'vertical' },
  properties: stackComponentPropertiesSchema,
  children: 'elements-or-sections',
};
