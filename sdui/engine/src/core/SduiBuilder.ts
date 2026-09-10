import type {
  SduiComponent,
  SduiElement,
  SduiGroup,
  SduiScreen,
  SduiSection,
  SduiTargetApp,
  SduiTemplate,
  SduiTheme,
} from './SduiModel.js';
import { CURRENT_SDUI_SCHEMA_VERSION } from './SduiModel.js';
import type { ButtonProperties } from '../nodes/element/Button.js';
import type { ImageProperties } from '../nodes/element/Image.js';
import type { InputProperties } from '../nodes/element/Input.js';
import type { TextProperties } from '../nodes/element/Text.js';
import type { NodeDefinitionRegistry } from '../registry/NodeDefinitionRegistry.js';
import { createProductionNodeDefinitionRegistry } from '../registry/productionNodeDefinitions.js';

export interface SduiScreenOptions {
  readonly id: string;
  readonly targetApp: SduiTargetApp;
  readonly schemaVersion?: string;
  readonly theme?: SduiTheme;
  readonly metadata?: Record<string, unknown>;
}

export type SduiElementExtras = Omit<SduiElement, 'id' | 'type' | 'properties'>;

type Compose<TScope> = (scope: TScope) => void;

type ComponentBranch =
  | { readonly kind: 'elements'; readonly values: SduiElement[] }
  | { readonly kind: 'sections'; readonly values: SduiSection[] };

type SectionBranch =
  | { readonly kind: 'elements'; readonly values: SduiElement[] }
  | { readonly kind: 'groups'; readonly values: SduiGroup[] };

function withOptionalProperties(properties: Record<string, unknown>): { properties?: Record<string, unknown> } {
  return Object.keys(properties).length > 0 ? { properties } : {};
}

function withElementExtras(extras: SduiElementExtras | undefined): SduiElementExtras {
  return extras ?? {};
}

class NodeCreator {
  constructor(private readonly definitions: NodeDefinitionRegistry) {}

  properties(level: 'template' | 'component' | 'section' | 'group' | 'element', type: string, input: unknown): Record<string, unknown> {
    const definition = this.definitions.get(level, type);
    const parsed = definition.properties.parse({ ...(definition.defaults ?? {}), ...((input ?? {}) as object) });
    return parsed as Record<string, unknown>;
  }
}

class ElementScope {
  constructor(private readonly creator: NodeCreator, private readonly target: SduiElement[]) {}

  element(type: string, id: string, properties: unknown = {}, extras?: SduiElementExtras): void {
    const parsedProperties = this.creator.properties('element', type, properties);
    this.target.push({
      id,
      type,
      properties: parsedProperties,
      ...withElementExtras(extras),
    });
  }

  text(id: string, properties: TextProperties, extras?: SduiElementExtras): void {
    this.element('text', id, properties, extras);
  }

  image(id: string, properties: ImageProperties, extras?: SduiElementExtras): void {
    this.element('image', id, properties, extras);
  }

  input(id: string, properties: InputProperties, extras?: SduiElementExtras): void {
    this.element('input', id, properties, extras);
  }

  button(id: string, properties: ButtonProperties, extras?: SduiElementExtras): void {
    this.element('button', id, properties, extras);
  }
}

class GroupScope extends ElementScope {}

class SectionScope extends ElementScope {
  private branch?: SectionBranch;

  constructor(private readonly nodeCreator: NodeCreator) {
    const elements: SduiElement[] = [];
    super(nodeCreator, elements);
    this.directElements = elements;
  }

  private readonly directElements: SduiElement[];

  override element(type: string, id: string, properties: unknown = {}, extras?: SduiElementExtras): void {
    this.requireElementBranch();
    super.element(type, id, properties, extras);
  }

  group(type: string, id: string, properties: unknown = {}, compose: Compose<GroupScope>): void {
    if (this.branch?.kind === 'elements') {
      throw new Error('SDUI section cannot contain both elements and groups');
    }

    if (!this.branch) this.branch = { kind: 'groups', values: [] };

    const elements: SduiElement[] = [];
    const scope = new GroupScope(this.nodeCreator, elements);
    compose(scope);
    if (elements.length === 0) throw new Error(`SDUI group '${id}' requires at least one element`);

    const parsedProperties = this.nodeCreator.properties('group', type, properties);
    this.branch.values.push({ id, type, ...withOptionalProperties(parsedProperties), elements });
  }

  finish(sectionId: string): SectionBranch {
    if (!this.branch && this.directElements.length > 0) {
      this.branch = { kind: 'elements', values: this.directElements };
    }
    if (!this.branch || this.branch.values.length === 0) {
      throw new Error(`SDUI section '${sectionId}' requires exactly one non-empty branch: elements or groups`);
    }
    return this.branch;
  }

  private requireElementBranch(): void {
    if (this.branch?.kind === 'groups') {
      throw new Error('SDUI section cannot contain both elements and groups');
    }
    if (!this.branch) this.branch = { kind: 'elements', values: this.directElements };
  }
}

class ComponentScope extends ElementScope {
  private branch?: ComponentBranch;

  constructor(private readonly nodeCreator: NodeCreator) {
    const elements: SduiElement[] = [];
    super(nodeCreator, elements);
    this.directElements = elements;
  }

  private readonly directElements: SduiElement[];

  override element(type: string, id: string, properties: unknown = {}, extras?: SduiElementExtras): void {
    this.requireElementBranch();
    super.element(type, id, properties, extras);
  }

  section(type: string, id: string, properties: unknown = {}, compose: Compose<SectionScope>): void {
    if (this.branch?.kind === 'elements') {
      throw new Error('SDUI component cannot contain both elements and sections');
    }

    if (!this.branch) this.branch = { kind: 'sections', values: [] };

    const scope = new SectionScope(this.nodeCreator);
    compose(scope);
    const childBranch = scope.finish(id);
    const parsedProperties = this.nodeCreator.properties('section', type, properties);

    const section: SduiSection = childBranch.kind === 'elements'
      ? { id, type, ...withOptionalProperties(parsedProperties), elements: childBranch.values }
      : { id, type, ...withOptionalProperties(parsedProperties), groups: childBranch.values };

    this.branch.values.push(section);
  }

  finish(componentId: string): ComponentBranch {
    if (!this.branch && this.directElements.length > 0) {
      this.branch = { kind: 'elements', values: this.directElements };
    }
    if (!this.branch || this.branch.values.length === 0) {
      throw new Error(`SDUI component '${componentId}' requires exactly one non-empty branch: elements or sections`);
    }
    return this.branch;
  }

  private requireElementBranch(): void {
    if (this.branch?.kind === 'sections') {
      throw new Error('SDUI component cannot contain both elements and sections');
    }
    if (!this.branch) this.branch = { kind: 'elements', values: this.directElements };
  }
}

class TemplateScope {
  private readonly components: SduiComponent[] = [];

  constructor(private readonly creator: NodeCreator) {}

  component(type: string, id: string, properties: unknown = {}, compose: Compose<ComponentScope>): void {
    const scope = new ComponentScope(this.creator);
    compose(scope);
    const branch = scope.finish(id);
    const parsedProperties = this.creator.properties('component', type, properties);

    const component: SduiComponent = branch.kind === 'elements'
      ? { id, type, ...withOptionalProperties(parsedProperties), elements: branch.values }
      : { id, type, ...withOptionalProperties(parsedProperties), sections: branch.values };

    this.components.push(component);
  }

  finish(templateId: string): SduiComponent[] {
    if (this.components.length === 0) throw new Error(`SDUI template '${templateId}' requires at least one component`);
    return this.components;
  }
}

class ScreenScope {
  private templateValue?: SduiTemplate;

  constructor(private readonly creator: NodeCreator) {}

  template(type: string, id: string, properties: unknown = {}, compose: Compose<TemplateScope>): void {
    if (this.templateValue) throw new Error('SDUI screen requires exactly one template');

    const scope = new TemplateScope(this.creator);
    compose(scope);
    const components = scope.finish(id);
    const parsedProperties = this.creator.properties('template', type, properties);
    this.templateValue = { id, type, ...withOptionalProperties(parsedProperties), components };
  }

  finish(screenId: string): SduiTemplate {
    if (!this.templateValue) throw new Error(`SDUI screen '${screenId}' requires exactly one template`);
    return this.templateValue;
  }
}

/**
 * Minimal nested Builder DSL for authoring canonical SDUI trees.
 * Node definitions own type validity/defaults/properties; scopes own only hierarchy composition.
 */
export class SduiBuilder {
  private readonly creator: NodeCreator;

  constructor(definitions: NodeDefinitionRegistry = createProductionNodeDefinitionRegistry()) {
    this.creator = new NodeCreator(definitions);
  }

  screen(options: SduiScreenOptions, compose: Compose<ScreenScope>): SduiScreen {
    const scope = new ScreenScope(this.creator);
    compose(scope);

    return {
      screenId: options.id,
      schemaVersion: options.schemaVersion ?? CURRENT_SDUI_SCHEMA_VERSION,
      targetApp: options.targetApp,
      template: scope.finish(options.id),
      ...(options.theme ? { theme: options.theme } : {}),
      ...(options.metadata ? { metadata: options.metadata } : {}),
    };
  }
}

export const sdui = new SduiBuilder();
