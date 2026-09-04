import type { SduiElement } from '../../contract/element.schema.js';
import type { SduiGroup } from '../../contract/group.schema.js';
import type { SduiSection } from '../../contract/section.schema.js';
import { sectionRegistry, type InstanceInput } from '../../registry/registries.js';

/** Canonical product-neutral Section definition types available in production. */
export const PRODUCTION_SECTION_TYPES = Object.freeze(['content_section'] as const);

/**
 * Enforces the two legal Section child branches.
 *
 * @returns Either direct Elements or Groups, never both.
 * @throws Error when the Section is empty or mixes both branches.
 *
 * @remarks
 * This preserves the canonical paths:
 * `Template -> Component -> Section -> Element` and
 * `Template -> Component -> Section -> Group -> Element`.
 */
function content(input: InstanceInput): { elements: SduiElement[] } | { groups: SduiGroup[] } {
  const hasElements = Boolean(input.elements?.length);
  const hasGroups = Boolean(input.groups?.length);
  if (hasElements === hasGroups) {
    throw new Error("SDUI definition 'content_section' requires exactly one branch: elements or groups");
  }
  return hasElements ? { elements: input.elements! } : { groups: input.groups! };
}

/**
 * Registers the production Section vocabulary.
 *
 * @remarks
 * Sections are optional structural containers between Component and Element.
 * A Section may group Elements directly or through Groups, but may not expose
 * both branches simultaneously.
 */
export function registerProductionSectionDefinitions(): void {
  if (sectionRegistry.has('content_section')) return;
  sectionRegistry.register('content_section', (input: InstanceInput): SduiSection => ({
    id: input.id,
    type: 'content_section',
    properties: input.properties,
    ...content(input),
  }));
}
