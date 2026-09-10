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
import type { NodeDefinitionRegistry } from '../registry/NodeDefinitionRegistry.js';
import { createProductionNodeDefinitionRegistry } from '../registry/createProductionNodeDefinitionRegistry.js';
import {
  PropertyAccumulator,
  deepMergeRecord,
  type BasePropertyScope,
  type BehaviorPropertyScope,
  type ContentPropertyScope,
  type MetadataPropertyScope,
  type StylePropertyScope,
} from '../properties/PropertyScopes.js';

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

class NodeCreator {
  constructor(private readonly definitions: NodeDefinitionRegistry) {}

  properties(level: 'template' | 'component' | 'section' | 'group' | 'element', type: string, input: Record<string, unknown>): Record<string, unknown> {
    const definition = this.definitions.get(level, type);
    const resolved = deepMergeRecord(definition.defaults ?? {}, input);
    return definition.properties.parse(resolved) as Record<string, unknown>;
  }
}

/** A lightweight view over one node under construction; it is not a per-definition Builder. */
class ConfigurableNodeScope {
  protected readonly config = new PropertyAccumulator();

  base(): BasePropertyScope { return this.config.base; }
  style(): StylePropertyScope { return this.config.style; }
  content(): ContentPropertyScope { return this.config.content; }
  behavior(): BehaviorPropertyScope { return this.config.behavior; }
  metadata(): MetadataPropertyScope { return this.config.metadata; }

  propertyValues(): Record<string, unknown> { return this.config.properties; }
  extraValues(): SduiElementExtras { return this.config.extras as SduiElementExtras; }
}

class ElementNodeScope extends ConfigurableNodeScope {}

class ElementScope extends ConfigurableNodeScope {
  constructor(protected readonly creator: NodeCreator, private readonly target: SduiElement[]) { super(); }

  element(type: string, id: string, compose: Compose<ElementNodeScope>): void;
  element(type: string, id: string, properties: Record<string, unknown>, extras?: SduiElementExtras): void;
  element(type: string, id: string, composeOrProperties: Compose<ElementNodeScope> | Record<string, unknown>, extras?: SduiElementExtras): void {
    const node = new ElementNodeScope();
    if (typeof composeOrProperties === 'function') {
      composeOrProperties(node);
    } else {
      Object.assign(node.propertyValues(), composeOrProperties);
      Object.assign(node.extraValues(), extras ?? {});
    }

    const parsedProperties = this.creator.properties('element', type, node.propertyValues());
    this.target.push({ id, type, properties: parsedProperties, ...node.extraValues() });
  }

  text(id: string, compose: Compose<ElementNodeScope>): void;
  text(id: string, properties: Record<string, unknown>, extras?: SduiElementExtras): void;
  text(id: string, value: Compose<ElementNodeScope> | Record<string, unknown>, extras?: SduiElementExtras): void {
    if (typeof value === 'function') this.element('text', id, value);
    else this.element('text', id, value, extras);
  }

  image(id: string, compose: Compose<ElementNodeScope>): void;
  image(id: string, properties: Record<string, unknown>, extras?: SduiElementExtras): void;
  image(id: string, value: Compose<ElementNodeScope> | Record<string, unknown>, extras?: SduiElementExtras): void {
    if (typeof value === 'function') this.element('image', id, value);
    else this.element('image', id, value, extras);
  }

  input(id: string, compose: Compose<ElementNodeScope>): void;
  input(id: string, properties: Record<string, unknown>, extras?: SduiElementExtras): void;
  input(id: string, value: Compose<ElementNodeScope> | Record<string, unknown>, extras?: SduiElementExtras): void {
    if (typeof value === 'function') this.element('input', id, value);
    else this.element('input', id, value, extras);
  }

  button(id: string, compose: Compose<ElementNodeScope>): void;
  button(id: string, properties: Record<string, unknown>, extras?: SduiElementExtras): void;
  button(id: string, value: Compose<ElementNodeScope> | Record<string, unknown>, extras?: SduiElementExtras): void {
    if (typeof value === 'function') this.element('button', id, value);
    else this.element('button', id, value, extras);
  }
}

class GroupScope extends ElementScope {}

class SectionScope extends ElementScope {
  private branch?: SectionBranch;
  private readonly directElements: SduiElement[];

  constructor(creator: NodeCreator) {
    const elements: SduiElement[] = [];
    super(creator, elements);
    this.directElements = elements;
  }

  override element(type: string, id: string, compose: Compose<ElementNodeScope>): void;
  override element(type: string, id: string, properties: Record<string, unknown>, extras?: SduiElementExtras): void;
  override element(type: string, id: string, value: Compose<ElementNodeScope> | Record<string, unknown>, extras?: SduiElementExtras): void {
    this.requireElementBranch();
    if (typeof value === 'function') super.element(type, id, value);
    else super.element(type, id, value, extras);
  }

  group(type: string, id: string, compose: Compose<GroupScope>): void;
  group(type: string, id: string, properties: Record<string, unknown>, compose: Compose<GroupScope>): void;
  group(type: string, id: string, propertiesOrCompose: Record<string, unknown> | Compose<GroupScope>, maybeCompose?: Compose<GroupScope>): void {
    if (this.branch?.kind === 'elements') throw new Error('SDUI section cannot contain both elements and groups');
    if (!this.branch) this.branch = { kind: 'groups', values: [] };

    const elements: SduiElement[] = [];
    const scope = new GroupScope(this.creator, elements);
    if (typeof propertiesOrCompose === 'function') propertiesOrCompose(scope);
    else {
      Object.assign(scope.propertyValues(), propertiesOrCompose);
      if (!maybeCompose) throw new Error(`SDUI group '${id}' requires a composition callback`);
      maybeCompose(scope);
    }
    if (elements.length === 0) throw new Error(`SDUI group '${id}' requires at least one element`);

    const properties = this.creator.properties('group', type, scope.propertyValues());
    this.branch.values.push({ id, type, ...withOptionalProperties(properties), elements });
  }

  finish(sectionId: string): SectionBranch {
    if (!this.branch && this.directElements.length > 0) this.branch = { kind: 'elements', values: this.directElements };
    if (!this.branch || this.branch.values.length === 0) {
      throw new Error(`SDUI section '${sectionId}' requires exactly one non-empty branch: elements or groups`);
    }
    return this.branch;
  }

  private requireElementBranch(): void {
    if (this.branch?.kind === 'groups') throw new Error('SDUI section cannot contain both elements and groups');
    if (!this.branch) this.branch = { kind: 'elements', values: this.directElements };
  }
}

class ComponentScope extends ElementScope {
  private branch?: ComponentBranch;
  private readonly directElements: SduiElement[];

  constructor(creator: NodeCreator) {
    const elements: SduiElement[] = [];
    super(creator, elements);
    this.directElements = elements;
  }

  override element(type: string, id: string, compose: Compose<ElementNodeScope>): void;
  override element(type: string, id: string, properties: Record<string, unknown>, extras?: SduiElementExtras): void;
  override element(type: string, id: string, value: Compose<ElementNodeScope> | Record<string, unknown>, extras?: SduiElementExtras): void {
    this.requireElementBranch();
    if (typeof value === 'function') super.element(type, id, value);
    else super.element(type, id, value, extras);
  }

  section(type: string, id: string, compose: Compose<SectionScope>): void;
  section(type: string, id: string, properties: Record<string, unknown>, compose: Compose<SectionScope>): void;
  section(type: string, id: string, propertiesOrCompose: Record<string, unknown> | Compose<SectionScope>, maybeCompose?: Compose<SectionScope>): void {
    if (this.branch?.kind === 'elements') throw new Error('SDUI component cannot contain both elements and sections');
    if (!this.branch) this.branch = { kind: 'sections', values: [] };

    const scope = new SectionScope(this.creator);
    if (typeof propertiesOrCompose === 'function') propertiesOrCompose(scope);
    else {
      Object.assign(scope.propertyValues(), propertiesOrCompose);
      if (!maybeCompose) throw new Error(`SDUI section '${id}' requires a composition callback`);
      maybeCompose(scope);
    }
    const contentBranch = scope.finish(id);
    const properties = this.creator.properties('section', type, scope.propertyValues());
    const section: SduiSection = contentBranch.kind === 'elements'
      ? { id, type, ...withOptionalProperties(properties), elements: contentBranch.values }
      : { id, type, ...withOptionalProperties(properties), groups: contentBranch.values };
    this.branch.values.push(section);
  }

  finish(componentId: string): ComponentBranch {
    if (!this.branch && this.directElements.length > 0) this.branch = { kind: 'elements', values: this.directElements };
    if (!this.branch || this.branch.values.length === 0) {
      throw new Error(`SDUI component '${componentId}' requires exactly one non-empty branch: elements or sections`);
    }
    return this.branch;
  }

  private requireElementBranch(): void {
    if (this.branch?.kind === 'sections') throw new Error('SDUI component cannot contain both elements and sections');
    if (!this.branch) this.branch = { kind: 'elements', values: this.directElements };
  }
}

class TemplateScope extends ConfigurableNodeScope {
  private readonly components: SduiComponent[] = [];
  constructor(private readonly creator: NodeCreator) { super(); }

  component(type: string, id: string, compose: Compose<ComponentScope>): void;
  component(type: string, id: string, properties: Record<string, unknown>, compose: Compose<ComponentScope>): void;
  component(type: string, id: string, propertiesOrCompose: Record<string, unknown> | Compose<ComponentScope>, maybeCompose?: Compose<ComponentScope>): void {
    const scope = new ComponentScope(this.creator);
    if (typeof propertiesOrCompose === 'function') propertiesOrCompose(scope);
    else {
      Object.assign(scope.propertyValues(), propertiesOrCompose);
      if (!maybeCompose) throw new Error(`SDUI component '${id}' requires a composition callback`);
      maybeCompose(scope);
    }
    const contentBranch = scope.finish(id);
    const properties = this.creator.properties('component', type, scope.propertyValues());
    const component: SduiComponent = contentBranch.kind === 'elements'
      ? { id, type, ...withOptionalProperties(properties), elements: contentBranch.values }
      : { id, type, ...withOptionalProperties(properties), sections: contentBranch.values };
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

  template(type: string, id: string, compose: Compose<TemplateScope>): void;
  template(type: string, id: string, properties: Record<string, unknown>, compose: Compose<TemplateScope>): void;
  template(type: string, id: string, propertiesOrCompose: Record<string, unknown> | Compose<TemplateScope>, maybeCompose?: Compose<TemplateScope>): void {
    if (this.templateValue) throw new Error('SDUI screen requires exactly one template');
    const scope = new TemplateScope(this.creator);
    if (typeof propertiesOrCompose === 'function') propertiesOrCompose(scope);
    else {
      Object.assign(scope.propertyValues(), propertiesOrCompose);
      if (!maybeCompose) throw new Error(`SDUI template '${id}' requires a composition callback`);
      maybeCompose(scope);
    }
    const components = scope.finish(id);
    const properties = this.creator.properties('template', type, scope.propertyValues());
    this.templateValue = { id, type, ...withOptionalProperties(properties), components };
  }

  finish(screenId: string): SduiTemplate {
    if (!this.templateValue) throw new Error(`SDUI screen '${screenId}' requires exactly one template`);
    return this.templateValue;
  }
}

/** One explicit hierarchy Builder + fluent property views; definitions remain the schema/default authority. */
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
