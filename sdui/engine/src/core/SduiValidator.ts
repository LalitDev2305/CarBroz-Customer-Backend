import { parseSduiScreen } from '@carbroz/ui-sdk';
import type { SduiComponent, SduiElement, SduiGroup, SduiScreen, SduiSection, SduiTemplate } from './SduiModel.js';
import type { NodeDefinitionRegistry } from '../registry/NodeDefinitionRegistry.js';
import { createProductionNodeDefinitionRegistry } from '../registry/createProductionNodeDefinitionRegistry.js';

/** Canonical engine validation boundary: wire shape first, then hierarchy definition/property/event semantics. */
export class SduiValidator {
  constructor(private readonly definitions: NodeDefinitionRegistry = createProductionNodeDefinitionRegistry()) {}

  validate(input: unknown): SduiScreen {
    const screen = parseSduiScreen(input);
    this.validateTemplate(screen.template);
    return screen;
  }

  private validateTemplate(template: SduiTemplate): void {
    this.validateNode('template', template.type, template.properties ?? {});
    for (const component of template.components) this.validateComponent(component);
  }

  private validateComponent(component: SduiComponent): void {
    const definition = this.validateNode('component', component.type, component.properties ?? {});
    const hasElements = Boolean(component.elements?.length);
    const hasSections = Boolean(component.sections?.length);
    if (hasElements === hasSections) throw new Error(`SDUI component '${component.id}' requires elements XOR sections`);
    if (definition.children !== 'elements-or-sections') throw new Error(`SDUI component '${component.type}' has invalid child capability '${definition.children}'`);
    for (const element of component.elements ?? []) this.validateElement(element);
    for (const section of component.sections ?? []) this.validateSection(section);
  }

  private validateSection(section: SduiSection): void {
    const definition = this.validateNode('section', section.type, section.properties ?? {});
    const hasElements = Boolean(section.elements?.length);
    const hasGroups = Boolean(section.groups?.length);
    if (hasElements === hasGroups) throw new Error(`SDUI section '${section.id}' requires elements XOR groups`);
    if (definition.children !== 'elements-or-groups') throw new Error(`SDUI section '${section.type}' has invalid child capability '${definition.children}'`);
    for (const element of section.elements ?? []) this.validateElement(element);
    for (const group of section.groups ?? []) this.validateGroup(group);
  }

  private validateGroup(group: SduiGroup): void {
    const definition = this.validateNode('group', group.type, group.properties ?? {});
    if (definition.children !== 'elements' || !group.elements?.length) throw new Error(`SDUI group '${group.id}' requires elements`);
    for (const element of group.elements) this.validateElement(element);
  }

  private validateElement(element: SduiElement): void {
    const definition = this.validateNode('element', element.type, element.properties ?? {});
    const supported = new Set(definition.supportedEvents ?? []);
    for (const eventName of Object.keys(element.actions ?? {})) {
      if (!supported.has(eventName as never)) {
        throw new Error(`SDUI element '${element.id}' of type '${element.type}' does not support event '${eventName}'`);
      }
    }
  }

  private validateNode(level: 'template' | 'component' | 'section' | 'group' | 'element', type: string, properties: Record<string, unknown>) {
    const definition = this.definitions.get(level, type);
    definition.properties.parse(properties);
    return definition;
  }
}
