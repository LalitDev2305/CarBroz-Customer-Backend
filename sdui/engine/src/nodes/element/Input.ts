import { z } from 'zod';
import type { NodeDefinition } from '../../core/NodeDefinition.js';
import { backgroundSchema, borderSchema, shapeSchema } from '../../core/value-objects/Appearance.js';
import { dimensionSchema, textAlignmentSchema, weightSchema } from '../../core/value-objects/Layout.js';

export const INPUT = 'input';

export const inputPropertiesSchema = z.object({
  semanticRole: z.literal('input').optional(),
  placeholder: z.string().optional(),
  keyboardType: z.enum(['text', 'phone', 'number', 'email', 'password']).optional(),
  maxLength: z.number().int().positive().optional(),
  width: dimensionSchema.optional(),
  height: dimensionSchema.optional(),
  weight: weightSchema.optional(),
  fillMaxWidth: z.boolean().optional(),
  textAlign: textAlignmentSchema.optional(),
  background: backgroundSchema.optional(),
  border: borderSchema.optional(),
  shape: shapeSchema.optional(),
}).strict();

export type InputProperties = z.infer<typeof inputPropertiesSchema>;

export const InputDefinition: NodeDefinition<InputProperties> = {
  type: INPUT,
  level: 'element',
  defaults: { semanticRole: 'input', keyboardType: 'text' },
  properties: inputPropertiesSchema,
  children: 'none',
  categories: ['base', 'style', 'content', 'behavior', 'metadata'],
  supportedEvents: ['onValueChange', 'onFocus', 'onBlur'],
};
