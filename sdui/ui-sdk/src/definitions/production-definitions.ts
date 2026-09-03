import { PRODUCTION_COMPONENT_TYPES, registerProductionComponentDefinitions } from './components/index.js';
import { PRODUCTION_ELEMENT_TYPES, registerProductionElementDefinitions } from './elements/index.js';
import { PRODUCTION_GROUP_TYPES, registerProductionGroupDefinitions } from './groups/index.js';
import { PRODUCTION_SECTION_TYPES, registerProductionSectionDefinitions } from './sections/index.js';
import { PRODUCTION_TEMPLATE_TYPES, registerProductionTemplateDefinitions } from './templates/index.js';

export {
  PRODUCTION_COMPONENT_TYPES,
  PRODUCTION_ELEMENT_TYPES,
  PRODUCTION_GROUP_TYPES,
  PRODUCTION_SECTION_TYPES,
  PRODUCTION_TEMPLATE_TYPES,
};

export const PRODUCTION_SDUI_DEFINITION_TYPES = Object.freeze({
  templates: PRODUCTION_TEMPLATE_TYPES,
  components: PRODUCTION_COMPONENT_TYPES,
  sections: PRODUCTION_SECTION_TYPES,
  groups: PRODUCTION_GROUP_TYPES,
  elements: PRODUCTION_ELEMENT_TYPES,
});

/**
 * Registers the canonical product-neutral SDUI production vocabulary.
 * Registration is intentionally idempotent so package import and explicit
 * application bootstrap can both invoke it without creating duplicate types.
 */
export function registerProductionSduiDefinitions(): void {
  registerProductionElementDefinitions();
  registerProductionGroupDefinitions();
  registerProductionSectionDefinitions();
  registerProductionComponentDefinitions();
  registerProductionTemplateDefinitions();
}

registerProductionSduiDefinitions();
