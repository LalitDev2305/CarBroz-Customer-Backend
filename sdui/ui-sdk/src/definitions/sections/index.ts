import type { SduiElement } from '../../contract/element.schema.js';
import type { SduiGroup } from '../../contract/group.schema.js';
import type { SduiSection } from '../../contract/section.schema.js';
import { sectionRegistry, type InstanceInput } from '../../registry/registries.js';

export const PRODUCTION_SECTION_TYPES = Object.freeze(['content_section'] as const);

function content(input: InstanceInput): { elements: SduiElement[] } | { groups: SduiGroup[] } {
  const hasElements = Boolean(input.elements?.length);
  const hasGroups = Boolean(input.groups?.length);
  if (hasElements === hasGroups) {
    throw new Error("SDUI definition 'content_section' requires exactly one branch: elements or groups");
  }
  return hasElements ? { elements: input.elements! } : { groups: input.groups! };
}

export function registerProductionSectionDefinitions(): void {
  if (sectionRegistry.has('content_section')) return;
  sectionRegistry.register('content_section', (input: InstanceInput): SduiSection => ({
    id: input.id,
    type: 'content_section',
    properties: input.properties,
    ...content(input),
  }));
}
