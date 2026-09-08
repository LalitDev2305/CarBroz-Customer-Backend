import type { SduiElement } from '../../contract/element.schema.js';
import type { SduiGroup } from '../../contract/group.schema.js';
import { groupRegistry, type InstanceInput } from '../../registry/registries.js';

/** Canonical product-neutral Group definition types available in production. */
export const PRODUCTION_GROUP_TYPES = Object.freeze(['row_group', 'column_group', 'stack_group'] as const);

function requireElements(type: string, input: InstanceInput): SduiElement[] {
  if (!input.elements?.length) throw new Error(`SDUI definition '${type}' requires at least one element`);
  return input.elements;
}

function registerGroup(type: string, defaults: Record<string, unknown>): void {
  if (groupRegistry.has(type)) return;
  groupRegistry.register(type, (input: InstanceInput): SduiGroup => ({
    id: input.id,
    type,
    properties: { ...defaults, ...input.properties },
    elements: requireElements(type, input),
  }));
}

/** Registers product-neutral local layout definitions. */
export function registerProductionGroupDefinitions(): void {
  registerGroup('row_group', { axis: 'horizontal' });
  registerGroup('column_group', { axis: 'vertical' });
  registerGroup('stack_group', { orientation: 'vertical' });
}
