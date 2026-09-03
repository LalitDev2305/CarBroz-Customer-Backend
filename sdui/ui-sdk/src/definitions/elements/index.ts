import type { SduiElement } from '../../contract/element.schema.js';
import { elementRegistry, type InstanceInput } from '../../registry/registries.js';

export const PRODUCTION_ELEMENT_TYPES = Object.freeze([
  'text',
  'image',
  'icon',
  'button',
  'input',
  'spacer',
] as const);

function registerElement(type: string, defaults: Record<string, unknown>): void {
  if (elementRegistry.has(type)) return;
  elementRegistry.register(type, (input: InstanceInput): SduiElement => ({
    id: input.id,
    type,
    properties: { ...defaults, ...input.properties },
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
  registerElement('text', { semanticRole: 'text' });
  registerElement('image', { semanticRole: 'image' });
  registerElement('icon', { semanticRole: 'icon' });
  registerElement('button', { semanticRole: 'action' });
  registerElement('input', { semanticRole: 'input' });
  registerElement('spacer', { semanticRole: 'spacing' });
}
