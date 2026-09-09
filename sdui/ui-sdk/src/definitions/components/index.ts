import type { SduiComponent } from '../../contract/component.schema.js';
import type { SduiElement } from '../../contract/element.schema.js';
import type { SduiSection } from '../../contract/section.schema.js';
import { componentRegistry, type InstanceInput } from '../../registry/registries.js';
import { contentComponentPropertiesSchema } from './content/content-component.properties.js';
import { formComponentPropertiesSchema } from './form/form-component.properties.js';
import { stackComponentPropertiesSchema } from './stack/stack-component.properties.js';

export const PRODUCTION_COMPONENT_TYPES = Object.freeze(['content_component', 'form_component', 'stack_component'] as const);

type PropertySchema = { parse(input: unknown): unknown };

function content(type: string, input: InstanceInput): { elements: SduiElement[] } | { sections: SduiSection[] } {
  const hasElements = Boolean(input.elements?.length);
  const hasSections = Boolean(input.sections?.length);
  if (hasElements === hasSections) throw new Error(`SDUI definition '${type}' requires exactly one branch: elements or sections`);
  return hasElements ? { elements: input.elements! } : { sections: input.sections! };
}

function registerComponent(
  type: string,
  schema: PropertySchema,
  defaults: Record<string, unknown> = {},
): void {
  if (componentRegistry.has(type)) return;
  componentRegistry.register(type, (input: InstanceInput): SduiComponent => ({
    id: input.id,
    type,
    properties: schema.parse({ ...defaults, ...(input.properties ?? {}) }) as Record<string, unknown>,
    ...content(type, input),
  }));
}

export function registerProductionComponentDefinitions(): void {
  registerComponent('content_component', contentComponentPropertiesSchema);
  registerComponent('form_component', formComponentPropertiesSchema, { semanticRole: 'form' });
  registerComponent('stack_component', stackComponentPropertiesSchema, { orientation: 'vertical' });
}
