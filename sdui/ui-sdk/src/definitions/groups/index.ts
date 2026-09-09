import type { SduiElement } from '../../contract/element.schema.js';
import type { SduiGroup } from '../../contract/group.schema.js';
import { groupRegistry, type InstanceInput } from '../../registry/registries.js';
import { columnGroupPropertiesSchema } from './column/column-group.properties.js';
import { rowGroupPropertiesSchema } from './row/row-group.properties.js';
import { stackGroupPropertiesSchema } from './stack/stack-group.properties.js';

export const PRODUCTION_GROUP_TYPES = Object.freeze(['row_group', 'column_group', 'stack_group'] as const);

type PropertySchema = { parse(input: unknown): unknown };

function requireElements(type: string, input: InstanceInput): SduiElement[] {
  if (!input.elements?.length) throw new Error(`SDUI definition '${type}' requires at least one element`);
  return input.elements;
}

function registerGroup(
  type: string,
  schema: PropertySchema,
  defaults: Record<string, unknown>,
): void {
  if (groupRegistry.has(type)) return;
  groupRegistry.register(type, (input: InstanceInput): SduiGroup => ({
    id: input.id,
    type,
    properties: schema.parse({ ...defaults, ...(input.properties ?? {}) }) as Record<string, unknown>,
    elements: requireElements(type, input),
  }));
}

export function registerProductionGroupDefinitions(): void {
  registerGroup('row_group', rowGroupPropertiesSchema, { axis: 'horizontal', orientation: 'horizontal' });
  registerGroup('column_group', columnGroupPropertiesSchema, { axis: 'vertical', orientation: 'vertical' });
  registerGroup('stack_group', stackGroupPropertiesSchema, { orientation: 'vertical' });
}
