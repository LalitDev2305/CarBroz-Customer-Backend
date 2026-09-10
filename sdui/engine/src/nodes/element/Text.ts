import { z } from 'zod';
import type { NodeDefinition } from '../../core/NodeDefinition.js';
import { actionSchema, valueReferenceSchema } from '../../core/SduiModel.js';
import { accessoriesSchema } from '../../core/value-objects/Accessory.js';
import { colorSchema } from '../../core/value-objects/Appearance.js';
import { dimensionSchema, textAlignmentSchema, weightSchema } from '../../core/value-objects/Layout.js';

export const TEXT = 'text';

/** Generic ordered inline run used for partial text styling, dynamic content and independently actionable text. */
export const textSpanSchema = z.object({
  text: z.union([z.string(), valueReferenceSchema]),
  fontWeight: z.number().int().min(100).max(900).optional(),
  color: colorSchema.optional(),
  underline: z.boolean().optional(),
  onClick: actionSchema.optional(),
}).strict();

export type TextSpan = z.infer<typeof textSpanSchema>;

export const textPropertiesSchema = z.object({
  semanticRole: z.literal('text').optional(),
  text: z.union([z.string(), valueReferenceSchema]).optional(),
  spans: z.array(textSpanSchema).min(1).optional(),
  fontSize: z.number().finite().positive().optional(),
  fontWeight: z.number().int().min(100).max(900).optional(),
  lineHeight: z.number().finite().positive().optional(),
  letterSpacing: z.number().finite().optional(),
  color: colorSchema.optional(),
  disabledColor: colorSchema.optional(),
  textAlign: textAlignmentSchema.optional(),
  width: dimensionSchema.optional(),
  height: dimensionSchema.optional(),
  maxWidth: dimensionSchema.optional(),
  weight: weightSchema.optional(),
  fillMaxWidth: z.boolean().optional(),
  enabled: z.boolean().optional(),
  leading: accessoriesSchema.optional(),
  trailing: accessoriesSchema.optional(),
}).strict().superRefine((properties, context) => {
  const hasText = properties.text !== undefined;
  const hasSpans = properties.spans !== undefined;
  if (hasText === hasSpans) {
    context.addIssue({
      code: 'custom',
      path: ['text'],
      message: 'text element requires exactly one content mode: text or spans',
    });
  }
});

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
