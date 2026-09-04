import type { SduiElement } from '../../contract/element.schema.js';
import { elementRegistry, type InstanceInput } from '../../registry/registries.js';

/** Canonical product-neutral Element definition types available in production. */
export const PRODUCTION_ELEMENT_TYPES = Object.freeze([
  'text',
  'image',
  'icon',
  'button',
  'input',
  'spacer',
] as const);

/**
 * Registers one reusable leaf Element definition.
 *
 * @param type - Stable canonical Element type.
 * @param defaults - Product-neutral semantic defaults merged before runtime properties.
 *
 * @remarks
 * Element is always a leaf in the canonical SDUI hierarchy. It may carry
 * behavior/configuration metadata such as actions, analytics, accessibility,
 * validation, binding and visibility, but it may never own structural child
 * nodes.
 *
 * Runtime content belongs to `InstanceInput`; this helper must not contain
 * screen-name, Partner, Customer or other business-domain logic.
 */
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

/**
 * Registers the production Element vocabulary.
 *
 * @remarks
 * Add a new reusable leaf capability by registering a new generic definition
 * and its tests. Existing unrelated elements and engine components should not
 * require modification.
 */
export function registerProductionElementDefinitions(): void {
  registerElement('text', { semanticRole: 'text' });
  registerElement('image', { semanticRole: 'image' });
  registerElement('icon', { semanticRole: 'icon' });
  registerElement('button', { semanticRole: 'action' });
  registerElement('input', { semanticRole: 'input' });
  registerElement('spacer', { semanticRole: 'spacing' });
}
