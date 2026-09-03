import type { SduiElement } from '../../contract/element.schema.js';
import type { SduiGroup } from '../../contract/group.schema.js';
import { groupRegistry, type InstanceInput } from '../../registry/registries.js';

export const PRODUCTION_GROUP_TYPES = Object.freeze(['row_group', 'column_group'] as const);

function requireElements(type: string, input: InstanceInput): SduiElement[] {
  if (!input.elements?.length) throw new Error(`SDUI definition '${type}' requires at least one element`);
  return input.elements;
}

function registerGroup(type: string, axis: 'horizontal' | 'vertical'): void {
  if (groupRegistry.has(type)) return;
  groupRegistry.register(type, (input: InstanceInput): SduiGroup => ({
    id: input.id,
    type,
    properties: { axis, ...input.properties },
    elements: requireElements(type, input),
  }));
}

export function registerProductionGroupDefinitions(): void {
  registerGroup('row_group', 'horizontal');
  registerGroup('column_group', 'vertical');
}
