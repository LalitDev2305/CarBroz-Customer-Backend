import type { SduiComponent } from '../contract/component.schema.js';
import type { SduiElement } from '../contract/element.schema.js';
import type { SduiGroup } from '../contract/group.schema.js';
import type { SduiSection } from '../contract/section.schema.js';
import { screenSchema, type SduiScreen } from '../contract/screen.schema.js';
import type { SduiTemplate } from '../contract/template.schema.js';
import { registerProductionSduiDefinitions } from '../definitions/production-definitions.js';
import { ComponentFactory, ElementFactory, GroupFactory, SectionFactory, TemplateFactory } from '../factory/NodeFactories.js';
import { isSupportedSduiSchemaVersion } from '../versioning/SchemaVersion.js';

function validateElementDefinition(element: SduiElement): void {
  ElementFactory.create(element.type, element);
}

function validateGroupDefinition(group: SduiGroup): void {
  for (const element of group.elements) validateElementDefinition(element);
  GroupFactory.create(group.type, group);
}

function validateSectionDefinition(section: SduiSection): void {
  if ('elements' in section) {
    for (const element of section.elements) validateElementDefinition(element);
  } else {
    for (const group of section.groups) validateGroupDefinition(group);
  }
  SectionFactory.create(section.type, section);
}

function validateComponentDefinition(component: SduiComponent): void {
  if ('elements' in component) {
    for (const element of component.elements) validateElementDefinition(element);
  } else {
    for (const section of component.sections) validateSectionDefinition(section);
  }
  ComponentFactory.create(component.type, component);
}

function validateTemplateDefinition(template: SduiTemplate): void {
  for (const component of template.components) validateComponentDefinition(component);
  TemplateFactory.create(template.type, template);
}

function validateVersionAndTarget(screen: SduiScreen): void {
  if (!isSupportedSduiSchemaVersion(screen.schemaVersion)) {
    throw new Error(`Unsupported SDUI schema version '${screen.schemaVersion}'`);
  }
}

/**
 * Authoritative layered SDUI validation boundary.
 *
 * Layer 1: structural JSON contract (screenSchema)
 * Layer 2: hierarchy/XOR/unique-id invariants (canonical structural schemas)
 * Layer 3: registered reusable definition lookup (factories/registries)
 * Layer 4: definition-specific property contracts (definition producers)
 * Layer 5: definition and cross-field invariants (factory + structural refinements)
 * Layer 6: supported schema version and target scope
 */
export function parseSduiScreen(input: unknown): SduiScreen {
  const screen = screenSchema.parse(input);
  registerProductionSduiDefinitions();
  validateTemplateDefinition(screen.template);
  validateVersionAndTarget(screen);
  return screen;
}

/** Layer 7 publication boundary. Publication requires every canonical validation layer to pass. */
export function parseSduiScreenForPublication(input: unknown): SduiScreen {
  return parseSduiScreen(input);
}

export function isValidSduiScreen(input: unknown): input is SduiScreen {
  try {
    parseSduiScreen(input);
    return true;
  } catch {
    return false;
  }
}

export function isValidSduiScreenForPublication(input: unknown): input is SduiScreen {
  try {
    parseSduiScreenForPublication(input);
    return true;
  } catch {
    return false;
  }
}
