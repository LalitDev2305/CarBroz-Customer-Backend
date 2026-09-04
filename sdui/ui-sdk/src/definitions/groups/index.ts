import type { SduiElement } from '../../contract/element.schema.js';
import type { SduiGroup } from '../../contract/group.schema.js';
import { groupRegistry, type InstanceInput } from '../../registry/registries.js';

/** Canonical product-neutral Group definition types available in production. */
export const PRODUCTION_GROUP_TYPES = Object.freeze(['row_group', 'column_group'] as const);

/**
 * Enforces the Group -> Element invariant.
 *
 * @throws Error when a Group has no Elements.
 *
 * @remarks
 * Group is the final optional structural level. It may contain Elements only;
 * it must never contain Section, Component, Template or another Group.
 */
function requireElements(type: string, input: InstanceInput): SduiElement[] {
  if (!input.elements?.length) throw new Error(`SDUI definition '${type}' requires at least one element`);
  return input.elements;
}

/**
 * Registers one reusable Group definition.
 *
 * @param type - Stable canonical Group type.
 * @param axis - Product-neutral layout axis supplied as a default property.
 */
function registerGroup(type: string, axis: 'horizontal' | 'vertical'): void {
  if (groupRegistry.has(type)) return;
  groupRegistry.register(type, (input: InstanceInput): SduiGroup => ({
    id: input.id,
    type,
    properties: { axis, ...input.properties },
    elements: requireElements(type, input),
  }));
}

/** Registers the production Group vocabulary. */
export function registerProductionGroupDefinitions(): void {
  registerGroup('row_group', 'horizontal');
  registerGroup('column_group', 'vertical');
}
