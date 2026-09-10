import { parseSduiScreen } from '@carbroz/ui-sdk';
import type { SduiComponent, SduiElement, SduiGroup, SduiScreen, SduiSection, SduiTemplate } from './SduiModel.js';
import type { NodeDefinition, SduiNodeLevel } from './NodeDefinition.js';
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
    const definition = this.validateNode('template', template.type, template.properties ?? {});
    if (definition.children !== 'components') throw new Error(`SDUI template '${template.type}' cannot own components`);
    for (const component of template.components) this.validateComponent(component);
  }

  private validateComponent(component: SduiComponent): void {
    const definition = this.validateNode('component', component.type, component.properties ?? {});
    if (definition.children !== 'elements-or-sections') throw new Error(`SDUI component '${component.type}' has invalid child capability '${definition.children}'`);
    if ('elements' in component) {
      for (const element of component.elements) this.validateElement(element);
      return;
    }
    for (const section of component.sections) this.validateSection(section);
  }

  private validateSection(section: SduiSection): void {
    const definition = this.validateNode('section', section.type, section.properties ?? {});
    if (definition.children !== 'elements-or-groups') throw new Error(`SDUI section '${section.type}' has invalid child capability '${definition.children}'`);
    if ('elements' in section) {
      for (const element of section.elements) this.validateElement(element);
      return;
    }
    for (const group of section.groups) this.validateGroup(group);
  }

  private validateGroup(group: SduiGroup): void {
    const definition = this.validateNode('group', group.type, group.properties ?? {});
    if (definition.children !== 'elements') throw new Error(`SDUI group '${group.type}' cannot own elements`);
    for (const element of group.elements) this.validateElement(element);
  }

  private validateElement(element: SduiElement): void {
    const definition = this.validateNode('element', element.type, element.properties ?? {});
    if (definition.children !== 'none') throw new Error(`SDUI element '${element.type}' must be terminal`);
    const supported = new Set<string>(definition.supportedEvents ?? []);
    for (const eventName of Object.keys(element.actions ?? {})) {
      if (!supported.has(eventName)) {
        throw new Error(`SDUI element '${element.id}' of type '${element.type}' does not support event '${eventName}'`);
      }
    }
  }

  private validateNode(level: SduiNodeLevel, type: string, properties: Record<string, unknown>): NodeDefinition {
    const definition = this.definitions.get(level, type);
    definition.properties.parse(properties);
    return definition;
  }
}
