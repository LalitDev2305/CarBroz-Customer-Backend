import type { SduiComponent } from '../contract/component.schema.js';
import type { SduiElement } from '../contract/element.schema.js';
import type { SduiGroup } from '../contract/group.schema.js';
import type { SduiSection } from '../contract/section.schema.js';
import type { SduiTemplate } from '../contract/template.schema.js';
import { DefinitionRegistry } from './DefinitionRegistry.js';

/**
 * Runtime data accepted by reusable SDUI definitions.
 * Structural children are optional here because each registry consumes only the
 * child collection legal for its own level; final legality is enforced by the
 * canonical Zod schemas in NodeFactories.
 */
export interface InstanceInput {
  id: string;
  properties?: Record<string, unknown>;
  actions?: SduiElement['actions'];
  analytics?: SduiElement['analytics'];
  accessibility?: SduiElement['accessibility'];
  validation?: SduiElement['validation'];
  binding?: SduiElement['binding'];
  visibility?: SduiElement['visibility'];
  metadata?: SduiElement['metadata'];
  elements?: SduiElement[];
  groups?: SduiGroup[];
  sections?: SduiSection[];
  components?: SduiComponent[];
}

export const templateRegistry = new DefinitionRegistry<InstanceInput, SduiTemplate>();
export const componentRegistry = new DefinitionRegistry<InstanceInput, SduiComponent>();
export const sectionRegistry = new DefinitionRegistry<InstanceInput, SduiSection>();
export const groupRegistry = new DefinitionRegistry<InstanceInput, SduiGroup>();
export const elementRegistry = new DefinitionRegistry<InstanceInput, SduiElement>();
