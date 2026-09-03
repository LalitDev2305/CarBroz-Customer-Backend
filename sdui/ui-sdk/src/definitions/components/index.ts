import type { SduiComponent } from '../../contract/component.schema.js';
import type { SduiElement } from '../../contract/element.schema.js';
import type { SduiSection } from '../../contract/section.schema.js';
import { componentRegistry, type InstanceInput } from '../../registry/registries.js';

export const PRODUCTION_COMPONENT_TYPES = Object.freeze(['content_component', 'form_component'] as const);

function content(type: string, input: InstanceInput): { elements: SduiElement[] } | { sections: SduiSection[] } {
  const hasElements = Boolean(input.elements?.length);
  const hasSections = Boolean(input.sections?.length);
  if (hasElements === hasSections) {
    throw new Error(`SDUI definition '${type}' requires exactly one branch: elements or sections`);
  }
  return hasElements ? { elements: input.elements! } : { sections: input.sections! };
}

function registerComponent(type: string, defaults: Record<string, unknown> = {}): void {
  if (componentRegistry.has(type)) return;
  componentRegistry.register(type, (input: InstanceInput): SduiComponent => ({
    id: input.id,
    type,
    properties: { ...defaults, ...input.properties },
    ...content(type, input),
  }));
}

export function registerProductionComponentDefinitions(): void {
  registerComponent('content_component');
  registerComponent('form_component', { semanticRole: 'form' });
}
