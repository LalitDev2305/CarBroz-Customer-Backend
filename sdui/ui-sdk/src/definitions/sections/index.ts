import type { SduiElement } from '../../contract/element.schema.js';
import type { SduiGroup } from '../../contract/group.schema.js';
import type { SduiSection } from '../../contract/section.schema.js';
import { sectionRegistry, type InstanceInput } from '../../registry/registries.js';
import { contentSectionPropertiesSchema } from './content/content-section.properties.js';
import { stackSectionPropertiesSchema } from './stack/stack-section.properties.js';

export const PRODUCTION_SECTION_TYPES = Object.freeze(['content_section', 'stack_section'] as const);

type PropertySchema = { parse(input: unknown): unknown };

function content(type: string, input: InstanceInput): { elements: SduiElement[] } | { groups: SduiGroup[] } {
  const hasElements = Boolean(input.elements?.length);
  const hasGroups = Boolean(input.groups?.length);
  if (hasElements === hasGroups) throw new Error(`SDUI definition '${type}' requires exactly one branch: elements or groups`);
  return hasElements ? { elements: input.elements! } : { groups: input.groups! };
}

function registerSection(
  type: string,
  schema: PropertySchema,
  defaults: Record<string, unknown> = {},
): void {
  if (sectionRegistry.has(type)) return;
  sectionRegistry.register(type, (input: InstanceInput): SduiSection => ({
    id: input.id,
    type,
    properties: schema.parse({ ...defaults, ...(input.properties ?? {}) }) as Record<string, unknown>,
    ...content(type, input),
  }));
}

export function registerProductionSectionDefinitions(): void {
  registerSection('content_section', contentSectionPropertiesSchema);
  registerSection('stack_section', stackSectionPropertiesSchema, { orientation: 'vertical' });
}
