import { type SduiComponent } from '../contract/component.schema.js';
import { type SduiElement } from '../contract/element.schema.js';
import { type SduiGroup } from '../contract/group.schema.js';
import { type SduiSection } from '../contract/section.schema.js';
import { type SduiTemplate } from '../contract/template.schema.js';
import { DefinitionRegistry } from './DefinitionRegistry.js';

export interface InstanceInput {
  id: string;
  properties?: Record<string, unknown>;
}

export const templateRegistry = new DefinitionRegistry<InstanceInput, SduiTemplate>();
export const componentRegistry = new DefinitionRegistry<InstanceInput, SduiComponent>();
export const sectionRegistry = new DefinitionRegistry<InstanceInput, SduiSection>();
export const groupRegistry = new DefinitionRegistry<InstanceInput, SduiGroup>();
export const elementRegistry = new DefinitionRegistry<InstanceInput, SduiElement>();
