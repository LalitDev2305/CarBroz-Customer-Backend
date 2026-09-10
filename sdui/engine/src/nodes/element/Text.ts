import { z } from 'zod';
import type { NodeDefinition } from '../../core/NodeDefinition.js';
import { accessoriesSchema } from '../../core/value-objects/Accessory.js';
import { colorSchema } from '../../core/value-objects/Appearance.js';
import { dimensionSchema, textAlignmentSchema, weightSchema } from '../../core/value-objects/Layout.js';

export const TEXT = 'text';

export const textPropertiesSchema = z.object({
  semanticRole: z.literal('text').optional(),
  text: z.string(),
  fontSize: z.number().finite().positive().optional(),
  fontWeight: z.number().int().min(100).max(900).optional(),
  lineHeight: z.number().finite().positive().optional(),
  letterSpacing: z.number().finite().optional(),
  color: colorSchema.optional(),
  textAlign: textAlignmentSchema.optional(),
  width: dimensionSchema.optional(),
  height: dimensionSchema.optional(),
  maxWidth: dimensionSchema.optional(),
  weight: weightSchema.optional(),
  fillMaxWidth: z.boolean().optional(),
  leading: accessoriesSchema.optional(),
  trailing: accessoriesSchema.optional(),
}).strict();

export type TextProperties = z.infer<typeof textPropertiesSchema>;

export const TextDefinition: NodeDefinition<TextProperties> = {
  type: TEXT,
  level: 'element',
  defaults: { semanticRole: 'text' },
  properties: textPropertiesSchema,
  children: 'none',
  categories: ['base', 'style', 'content', 'behavior', 'metadata'],
  supportedEvents: ['onClick', 'onLongClick'],
};
