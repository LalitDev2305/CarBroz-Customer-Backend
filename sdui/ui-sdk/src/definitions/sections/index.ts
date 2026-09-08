import type { SduiElement } from '../../contract/element.schema.js';
import type { SduiGroup } from '../../contract/group.schema.js';
import type { SduiSection } from '../../contract/section.schema.js';
import { sectionRegistry, type InstanceInput } from '../../registry/registries.js';

/** Canonical product-neutral Section definition types available in production. */
export const PRODUCTION_SECTION_TYPES = Object.freeze(['content_section', 'stack_section'] as const);

function content(type: string, input: InstanceInput): { elements: SduiElement[] } | { groups: SduiGroup[] } {
  const hasElements = Boolean(input.elements?.length);
  const hasGroups = Boolean(input.groups?.length);
  if (hasElements === hasGroups) throw new Error(`SDUI definition '${type}' requires exactly one branch: elements or groups`);
  return hasElements ? { elements: input.elements! } : { groups: input.groups! };
}

function registerSection(type: string, defaults: Record<string, unknown> = {}): void {
  if (sectionRegistry.has(type)) return;
  sectionRegistry.register(type, (input: InstanceInput): SduiSection => ({
    id: input.id,
    type,
    properties: { ...defaults, ...input.properties },
    ...content(type, input),
  }));
}

/** Registers product-neutral nested layout definitions. */
export function registerProductionSectionDefinitions(): void {
  registerSection('content_section');
  registerSection('stack_section', { orientation: 'vertical' });
}
