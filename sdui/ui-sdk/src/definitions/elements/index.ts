import type { SduiElement } from '../../contract/element.schema.js';
import { elementRegistry, type InstanceInput } from '../../registry/registries.js';
import { buttonPropertiesSchema } from './button/button.properties.js';
import { dividerPropertiesSchema } from './divider/divider.properties.js';
import { iconPropertiesSchema } from './icon/icon.properties.js';
import { imagePropertiesSchema } from './image/image.properties.js';
import { inputPropertiesSchema } from './input/input.properties.js';
import { spacerPropertiesSchema } from './spacer/spacer.properties.js';
import { textPropertiesSchema } from './text/text.properties.js';

export const PRODUCTION_ELEMENT_TYPES = Object.freeze([
  'text', 'image', 'icon', 'button', 'input', 'divider', 'spacer',
] as const);

type PropertySchema = { parse(input: unknown): unknown };

function registerElement(
  type: string,
  schema: PropertySchema,
  defaults: Record<string, unknown>,
): void {
  if (elementRegistry.has(type)) return;
  elementRegistry.register(type, (input: InstanceInput): SduiElement => ({
    id: input.id,
    type,
    properties: schema.parse({ ...defaults, ...(input.properties ?? {}) }) as Record<string, unknown>,
    ...(input.actions ? { actions: input.actions } : {}),
    ...(input.analytics ? { analytics: input.analytics } : {}),
    ...(input.accessibility ? { accessibility: input.accessibility } : {}),
    ...(input.validation ? { validation: input.validation } : {}),
    ...(input.binding ? { binding: input.binding } : {}),
    ...(input.visibility ? { visibility: input.visibility } : {}),
    ...(input.metadata ? { metadata: input.metadata } : {}),
  }));
}

export function registerProductionElementDefinitions(): void {
  registerElement('text', textPropertiesSchema, { semanticRole: 'text' });
  registerElement('image', imagePropertiesSchema, { semanticRole: 'image' });
  registerElement('icon', iconPropertiesSchema, { semanticRole: 'icon' });
  registerElement('button', buttonPropertiesSchema, { semanticRole: 'action' });
  registerElement('input', inputPropertiesSchema, { semanticRole: 'input' });
  registerElement('divider', dividerPropertiesSchema, { semanticRole: 'divider' });
  registerElement('spacer', spacerPropertiesSchema, { semanticRole: 'spacing' });
}
