import type {
  SduiAction,
  SduiComponent,
  SduiElement,
  SduiGroup,
  SduiScreen,
  SduiSection,
  SduiTargetApp,
  SduiTemplate,
  SduiValueReference,
} from './SduiModel.js';
import { CURRENT_SDUI_SCHEMA_VERSION, DEFAULT_SDUI_THEME, themeSchema } from './SduiModel.js';
import type { NodeDefinitionRegistry } from '../registry/NodeDefinitionRegistry.js';
import { createProductionNodeDefinitionRegistry } from '../registry/createProductionNodeDefinitionRegistry.js';
import { PropertyAccumulator, deepMergeRecord } from '../properties/PropertyScopes.js';
import type { Accessory } from './value-objects/Accessory.js';
import type { Background, Border, Shape } from './value-objects/Appearance.js';
import type {
  Arrangement,
  EdgeInsets,
  HorizontalAlignment,
  Orientation,
  TextAlignment,
  VerticalAlignment,
} from './value-objects/Layout.js';
import type { SegmentedInputPresentation } from '../nodes/element/Input.js';
import type { TextSpan } from '../nodes/element/Text.js';

export type SduiElementExtras = Omit<SduiElement, 'id' | 'type' | 'properties'>;
type Compose<TScope> = (scope: TScope) => unknown;

type ComponentBranch =
  | { readonly kind: 'elements'; readonly values: SduiElement[] }
  | { readonly kind: 'sections'; readonly values: SduiSection[] };

type SectionBranch =
  | { readonly kind: 'elements'; readonly values: SduiElement[] }
  | { readonly kind: 'groups'; readonly values: SduiGroup[] };

type ThemeGradientColor = Readonly<{ color: string; stop: number }>;

function withOptionalProperties(properties: Record<string, unknown>): { properties?: Record<string, unknown> } {
  return Object.keys(properties).length > 0 ? { properties } : {};
}

function normalizeAccessories(value: Accessory | readonly Accessory[]): Accessory[] {
  return Array.isArray(value) ? [...value] : [value as Accessory];
}

class NodeCreator {
  constructor(private readonly definitions: NodeDefinitionRegistry) {}

  properties(
    level: 'template' | 'component' | 'section' | 'group' | 'element',
    type: string,
    input: Record<string, unknown>,
  ): Record<string, unknown> {
    const definition = this.definitions.get(level, type);
    const resolved = deepMergeRecord(definition.defaults ?? {}, input);
    return definition.properties.parse(resolved) as Record<string, unknown>;
  }
}

class PropertyNodeScope {
  protected readonly config = new PropertyAccumulator();

  protected setProperty(key: string, value: unknown): this {
    this.config.setProperty(key, value);
    return this;
  }

  protected mergeProperty(key: string, value: Record<string, unknown>): this {
    const current = this.config.properties[key];
    this.config.setProperty(
      key,
      deepMergeRecord(
        typeof current === 'object' && current !== null && !Array.isArray(current)
          ? current as Record<string, unknown>
          : {},
        value,
      ),
    );
    return this;
  }

  propertyValues(): Record<string, unknown> {
    return this.config.properties;
  }
}

class ContainerScope extends PropertyNodeScope {
  setWidth(value: number): this { return this.setProperty('width', value); }
  setHeight(value: number): this { return this.setProperty('height', value); }
  setMinWidth(value: number): this { return this.setProperty('minWidth', value); }
  setMinHeight(value: number): this { return this.setProperty('minHeight', value); }
  setMaxWidth(value: number): this { return this.setProperty('maxWidth', value); }
  setMaxHeight(value: number): this { return this.setProperty('maxHeight', value); }
  setFillMaxWidth(value = true): this { return this.setProperty('fillMaxWidth', value); }
  setFillMaxHeight(value = true): this { return this.setProperty('fillMaxHeight', value); }
  setFillMaxSize(value = true): this { return this.setProperty('fillMaxSize', value); }
  setOrientation(value: Orientation): this { return this.setProperty('orientation', value); }
  setVerticalArrangement(value: Arrangement): this { return this.setProperty('verticalArrangement', value); }
  setHorizontalArrangement(value: Arrangement): this { return this.setProperty('horizontalArrangement', value); }
  setSpacing(value: number): this {
    return this.propertyValues().orientation === 'horizontal'
      ? this.setHorizontalArrangement({ type: 'spacedBy', spacing: value })
      : this.setVerticalArrangement({ type: 'spacedBy', spacing: value });
  }
  setHorizontalAlignment(value: HorizontalAlignment): this { return this.setProperty('horizontalAlignment', value); }
  setVerticalAlignment(value: VerticalAlignment): this { return this.setProperty('verticalAlignment', value); }
  setPadding(value: number | EdgeInsets): this {
    return this.setProperty(
      'padding',
      typeof value === 'number'
        ? { start: value, top: value, end: value, bottom: value }
        : value,
    );
  }
  setPaddingHorizontal(value: number): this { return this.mergeProperty('padding', { start: value, end: value }); }
  setPaddingVertical(value: number): this { return this.mergeProperty('padding', { top: value, bottom: value }); }
  setPaddingStart(value: number): this { return this.mergeProperty('padding', { start: value }); }
  setPaddingTop(value: number): this { return this.mergeProperty('padding', { top: value }); }
  setPaddingEnd(value: number): this { return this.mergeProperty('padding', { end: value }); }
  setPaddingBottom(value: number): this { return this.mergeProperty('padding', { bottom: value }); }
  setBackground(value: Background): this { return this.setProperty('background', value); }
  setBorder(value: Border): this { return this.setProperty('border', value); }
  setShape(value: Shape): this { return this.setProperty('shape', value); }
}

class ElementBaseScope extends PropertyNodeScope {
  protected setExtra(key: keyof SduiElementExtras, value: unknown): this {
    this.config.setExtra(key, value);
    return this;
  }

  protected setEvent(name: string, action: SduiAction): this {
    const current = this.config.extras.actions;
    const actions = typeof current === 'object' && current !== null && !Array.isArray(current)
      ? current as Record<string, SduiAction>
      : {};
    return this.setExtra('actions', { ...actions, [name]: action });
  }

  setMetadata(value: Record<string, unknown>): this { return this.setExtra('metadata', value); }
  setAccessibility(value: Record<string, unknown>): this { return this.setExtra('accessibility', value); }
  setAnalytics(value: Record<string, unknown>): this { return this.setExtra('analytics', value); }

  extraValues(): SduiElementExtras {
    return this.config.extras as SduiElementExtras;
  }
}

class GenericElementScope extends ElementBaseScope {
  setPropertyValue(key: string, value: unknown): this { return this.setProperty(key, value); }
  setBinding(key: string): this { return this.setExtra('binding', { key }); }
  setValidation(value: Record<string, unknown>): this { return this.setExtra('validation', value); }
  setOnClick(value: SduiAction): this { return this.setEvent('onClick', value); }
  setOnLongClick(value: SduiAction): this { return this.setEvent('onLongClick', value); }
  setOnValueChange(value: SduiAction): this { return this.setEvent('onValueChange', value); }
  setOnFocus(value: SduiAction): this { return this.setEvent('onFocus', value); }
  setOnBlur(value: SduiAction): this { return this.setEvent('onBlur', value); }
}

class TextElementScope extends ElementBaseScope {
  setText(value: string | SduiValueReference): this { return this.setProperty('text', value); }
  setSpans(value: readonly TextSpan[]): this { return this.setProperty('spans', [...value]); }
  setFontSize(value: number): this { return this.setProperty('fontSize', value); }
  setFontWeight(value: number): this { return this.setProperty('fontWeight', value); }
  setLineHeight(value: number): this { return this.setProperty('lineHeight', value); }
  setLetterSpacing(value: number): this { return this.setProperty('letterSpacing', value); }
  setColor(value: string): this { return this.setProperty('color', value); }
  setDisabledColor(value: string): this { return this.setProperty('disabledColor', value); }
  setTextAlign(value: TextAlignment): this { return this.setProperty('textAlign', value); }
  setWidth(value: number): this { return this.setProperty('width', value); }
  setHeight(value: number): this { return this.setProperty('height', value); }
  setMaxWidth(value: number): this { return this.setProperty('maxWidth', value); }
  setWeight(value: number): this { return this.setProperty('weight', value); }
  setFillMaxWidth(value = true): this { return this.setProperty('fillMaxWidth', value); }
  setEnabled(value = true): this { return this.setProperty('enabled', value); }
  setLeading(value: Accessory | readonly Accessory[]): this { return this.setProperty('leading', normalizeAccessories(value)); }
  setTrailing(value: Accessory | readonly Accessory[]): this { return this.setProperty('trailing', normalizeAccessories(value)); }
  setOnClick(value: SduiAction): this { return this.setEvent('onClick', value); }
  setOnLongClick(value: SduiAction): this { return this.setEvent('onLongClick', value); }
}

class ImageElementScope extends ElementBaseScope {
  setUrl(value: string): this { return this.setProperty('url', value); }
  setWidth(value: number): this { return this.setProperty('width', value); }
  setHeight(value: number): this { return this.setProperty('height', value); }
  setMinWidth(value: number): this { return this.setProperty('minWidth', value); }
  setMinHeight(value: number): this { return this.setProperty('minHeight', value); }
  setMaxWidth(value: number): this { return this.setProperty('maxWidth', value); }
  setMaxHeight(value: number): this { return this.setProperty('maxHeight', value); }
  setFillMaxWidth(value = true): this { return this.setProperty('fillMaxWidth', value); }
  setFillMaxHeight(value = true): this { return this.setProperty('fillMaxHeight', value); }
  setContentScale(value: 'fit' | 'crop' | 'fillBounds' | 'inside'): this { return this.setProperty('contentScale', value); }
  setOnClick(value: SduiAction): this { return this.setEvent('onClick', value); }
  setOnLongClick(value: SduiAction): this { return this.setEvent('onLongClick', value); }
}

class InputElementScope extends ElementBaseScope {
  setPlaceholder(value: string): this { return this.setProperty('placeholder', value); }
  setKeyboardType(value: 'text' | 'phone' | 'number' | 'email' | 'password'): this { return this.setProperty('keyboardType', value); }
  setMaxLength(value: number): this { return this.setProperty('maxLength', value); }
  setWidth(value: number): this { return this.setProperty('width', value); }
  setHeight(value: number): this { return this.setProperty('height', value); }
  setWeight(value: number): this { return this.setProperty('weight', value); }
  setFillMaxWidth(value = true): this { return this.setProperty('fillMaxWidth', value); }
  setTextAlign(value: TextAlignment): this { return this.setProperty('textAlign', value); }
  setBackground(value: Background): this { return this.setProperty('background', value); }
  setBorder(value: Border): this { return this.setProperty('border', value); }
  setShape(value: Shape): this { return this.setProperty('shape', value); }
  setPresentation(value: SegmentedInputPresentation): this { return this.setProperty('presentation', value); }
  setBinding(key: string): this { return this.setExtra('binding', { key }); }
  setValidation(value: Record<string, unknown>): this { return this.setExtra('validation', value); }
  setOnValueChange(value: SduiAction): this { return this.setEvent('onValueChange', value); }
  setOnFocus(value: SduiAction): this { return this.setEvent('onFocus', value); }
  setOnBlur(value: SduiAction): this { return this.setEvent('onBlur', value); }
}

class ButtonElementScope extends ElementBaseScope {
  setText(value: string): this { return this.setProperty('text', value); }
  setWidth(value: number): this { return this.setProperty('width', value); }
  setHeight(value: number): this { return this.setProperty('height', value); }
  setFillMaxWidth(value = true): this { return this.setProperty('fillMaxWidth', value); }
  setFontSize(value: number): this { return this.setProperty('fontSize', value); }
  setFontWeight(value: number): this { return this.setProperty('fontWeight', value); }
  setTextColor(value: string): this { return this.setProperty('textColor', value); }
  setBackground(value: Background): this { return this.setProperty('background', value); }
  setShape(value: Shape): this { return this.setProperty('shape', value); }
  setLeading(value: Accessory | readonly Accessory[]): this { return this.setProperty('leading', normalizeAccessories(value)); }
  setTrailing(value: Accessory | readonly Accessory[]): this { return this.setProperty('trailing', normalizeAccessories(value)); }
  setOnClick(value: SduiAction): this { return this.setEvent('onClick', value); }
  setOnLongClick(value: SduiAction): this { return this.setEvent('onLongClick', value); }
}

class ElementContainerScope extends ContainerScope {
  constructor(
    protected readonly creator: NodeCreator,
    private readonly target: SduiElement[],
  ) { super(); }

  private appendElement<TScope extends ElementBaseScope>(
    type: string,
    id: string,
    scope: TScope,
    compose: Compose<TScope>,
  ): this {
    compose(scope);
    const properties = this.creator.properties('element', type, scope.propertyValues());
    this.target.push({ id, type, properties, ...scope.extraValues() });
    return this;
  }

  setElement(type: string, id: string, compose: Compose<GenericElementScope>): this {
    return this.appendElement(type, id, new GenericElementScope(), compose);
  }

  textElement(id: string, compose: Compose<TextElementScope>): this {
    return this.appendElement('text', id, new TextElementScope(), compose);
  }

  imageElement(id: string, compose: Compose<ImageElementScope>): this {
    return this.appendElement('image', id, new ImageElementScope(), compose);
  }

  inputElement(id: string, compose: Compose<InputElementScope>): this {
    return this.appendElement('input', id, new InputElementScope(), compose);
  }

  buttonElement(id: string, compose: Compose<ButtonElementScope>): this {
    return this.appendElement('button', id, new ButtonElementScope(), compose);
  }
}

class GroupScope extends ElementContainerScope {}

class SectionScope extends ElementContainerScope {
  private branch?: SectionBranch;
  private readonly directElements: SduiElement[];

  constructor(creator: NodeCreator) {
    const elements: SduiElement[] = [];
    super(creator, elements);
    this.directElements = elements;
  }

  override setElement(type: string, id: string, compose: Compose<GenericElementScope>): this {
    this.requireElementBranch();
    return super.setElement(type, id, compose);
  }
  override textElement(id: string, compose: Compose<TextElementScope>): this { this.requireElementBranch(); return super.textElement(id, compose); }
  override imageElement(id: string, compose: Compose<ImageElementScope>): this { this.requireElementBranch(); return super.imageElement(id, compose); }
  override inputElement(id: string, compose: Compose<InputElementScope>): this { this.requireElementBranch(); return super.inputElement(id, compose); }
  override buttonElement(id: string, compose: Compose<ButtonElementScope>): this { this.requireElementBranch(); return super.buttonElement(id, compose); }

  setGroup(type: string, id: string, compose: Compose<GroupScope>): this {
    if (this.branch?.kind === 'elements') throw new Error('SDUI section cannot contain both elements and groups');
    if (!this.branch) this.branch = { kind: 'groups', values: [] };

    const elements: SduiElement[] = [];
    const scope = new GroupScope(this.creator, elements);
    compose(scope);
    if (elements.length === 0) throw new Error(`SDUI group '${id}' requires at least one element`);

    const properties = this.creator.properties('group', type, scope.propertyValues());
    this.branch.values.push({ id, type, ...withOptionalProperties(properties), elements });
    return this;
  }

  stackGroup(id: string, compose: Compose<GroupScope>): this {
    return this.setGroup('stack_group', id, compose);
  }

  finish(sectionId: string): SectionBranch {
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

class ComponentScope extends ElementContainerScope {
  private branch?: ComponentBranch;
  private readonly directElements: SduiElement[];

  constructor(creator: NodeCreator) {
    const elements: SduiElement[] = [];
    super(creator, elements);
    this.directElements = elements;
  }

  setWeight(value: number): this { return this.setProperty('weight', value); }

  override setElement(type: string, id: string, compose: Compose<GenericElementScope>): this {
    this.requireElementBranch();
    return super.setElement(type, id, compose);
  }
  override textElement(id: string, compose: Compose<TextElementScope>): this { this.requireElementBranch(); return super.textElement(id, compose); }
  override imageElement(id: string, compose: Compose<ImageElementScope>): this { this.requireElementBranch(); return super.imageElement(id, compose); }
  override inputElement(id: string, compose: Compose<InputElementScope>): this { this.requireElementBranch(); return super.inputElement(id, compose); }
  override buttonElement(id: string, compose: Compose<ButtonElementScope>): this { this.requireElementBranch(); return super.buttonElement(id, compose); }

  setSection(type: string, id: string, compose: Compose<SectionScope>): this {
    if (this.branch?.kind === 'elements') throw new Error('SDUI component cannot contain both elements and sections');
    if (!this.branch) this.branch = { kind: 'sections', values: [] };

    const scope = new SectionScope(this.creator);
    compose(scope);
    const contentBranch = scope.finish(id);
    const properties = this.creator.properties('section', type, scope.propertyValues());
    const section: SduiSection = contentBranch.kind === 'elements'
      ? { id, type, ...withOptionalProperties(properties), elements: contentBranch.values }
      : { id, type, ...withOptionalProperties(properties), groups: contentBranch.values };
    this.branch.values.push(section);
    return this;
  }

  stackSection(id: string, compose: Compose<SectionScope>): this {
    return this.setSection('stack_section', id, compose);
  }

  finish(componentId: string): ComponentBranch {
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

class TemplateScope extends ContainerScope {
  private readonly components: SduiComponent[] = [];

  constructor(private readonly creator: NodeCreator) { super(); }

  setComponent(type: string, id: string, compose: Compose<ComponentScope>): this {
    const scope = new ComponentScope(this.creator);
    compose(scope);
    const contentBranch = scope.finish(id);
    const properties = this.creator.properties('component', type, scope.propertyValues());
    const component: SduiComponent = contentBranch.kind === 'elements'
      ? { id, type, ...withOptionalProperties(properties), elements: contentBranch.values }
      : { id, type, ...withOptionalProperties(properties), sections: contentBranch.values };
    this.components.push(component);
    return this;
  }

  stackComponent(id: string, compose: Compose<ComponentScope>): this {
    return this.setComponent('stack_component', id, compose);
  }

  finish(templateId: string): SduiComponent[] {
    if (this.components.length === 0) throw new Error(`SDUI template '${templateId}' requires at least one component`);
    return this.components;
  }
}

class ThemeScope {
  private readonly overrides: Record<string, unknown> = {};

  setMode(value: 'light' | 'dark'): this { this.overrides.theme = value; return this; }
  setShowBackButton(value: boolean): this { this.overrides.showBackButton = value; return this; }
  setStatusBar(value: 'transparent' | 'default'): this { this.overrides.statusBar = value; return this; }
  setGradientType(value: string): this { return this.setGradient({ type: value }); }
  setGradientAngle(value: number): this { return this.setGradient({ angle: value }); }
  setGradientColors(value: readonly ThemeGradientColor[]): this { return this.setGradient({ colors: [...value] }); }

  values(): Record<string, unknown> { return this.overrides; }

  private setGradient(value: Record<string, unknown>): this {
    const properties = typeof this.overrides.properties === 'object' && this.overrides.properties !== null && !Array.isArray(this.overrides.properties)
      ? this.overrides.properties as Record<string, unknown>
      : {};
    const gradient = typeof properties.gradient === 'object' && properties.gradient !== null && !Array.isArray(properties.gradient)
      ? properties.gradient as Record<string, unknown>
      : {};
    this.overrides.properties = {
      ...properties,
      gradient: deepMergeRecord(gradient, value),
    };
    return this;
  }
}

class ScreenScope {
  private templateValue?: SduiTemplate;
  private themeOverride: Record<string, unknown> = {};
  private schemaVersion = CURRENT_SDUI_SCHEMA_VERSION as string;
  private metadataValue?: Record<string, unknown>;

  constructor(private readonly creator: NodeCreator) {}

  setTheme(compose: Compose<ThemeScope>): this {
    const scope = new ThemeScope();
    compose(scope);
    this.themeOverride = deepMergeRecord(this.themeOverride, scope.values());
    return this;
  }

  setSchemaVersion(value: string): this { this.schemaVersion = value; return this; }
  setMetadata(value: Record<string, unknown>): this { this.metadataValue = value; return this; }

  setTemplate(type: string, id: string, compose: Compose<TemplateScope>): this {
    if (this.templateValue) throw new Error('SDUI screen requires exactly one template');
    const scope = new TemplateScope(this.creator);
    compose(scope);
    const components = scope.finish(id);
    const properties = this.creator.properties('template', type, scope.propertyValues());
    this.templateValue = { id, type, ...withOptionalProperties(properties), components };
    return this;
  }

  stackTemplate(id: string, compose: Compose<TemplateScope>): this { return this.setTemplate('stack_template', id, compose); }
  formTemplate(id: string, compose: Compose<TemplateScope>): this { return this.setTemplate('form_template', id, compose); }
  defaultTemplate(id: string, compose: Compose<TemplateScope>): this { return this.setTemplate('default_template', id, compose); }

  finish(screenId: string): { template: SduiTemplate; themeOverride: Record<string, unknown>; schemaVersion: string; metadata?: Record<string, unknown> } {
    if (!this.templateValue) throw new Error(`SDUI screen '${screenId}' requires exactly one template`);
    return {
      template: this.templateValue,
      themeOverride: this.themeOverride,
      schemaVersion: this.schemaVersion,
      ...(this.metadataValue ? { metadata: this.metadataValue } : {}),
    };
  }
}

/** One explicit hierarchy Builder DSL. NodeDefinitions remain the schema/default authority. */
export class SduiBuilder {
  private readonly creator: NodeCreator;

  constructor(definitions: NodeDefinitionRegistry = createProductionNodeDefinitionRegistry()) {
    this.creator = new NodeCreator(definitions);
  }

  screen(screenId: string, targetApp: SduiTargetApp, compose: Compose<ScreenScope>): SduiScreen {
    const scope = new ScreenScope(this.creator);
    compose(scope);
    const built = scope.finish(screenId);
    const theme = themeSchema.parse(deepMergeRecord(
      DEFAULT_SDUI_THEME as Record<string, unknown>,
      built.themeOverride,
    ));

    return {
      screenId,
      schemaVersion: built.schemaVersion,
      targetApp,
      template: built.template,
      theme,
      ...(built.metadata ? { metadata: built.metadata } : {}),
    };
  }
}

export const sdui = new SduiBuilder();
