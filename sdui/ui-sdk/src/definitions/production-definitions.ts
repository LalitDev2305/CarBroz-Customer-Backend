import type { SduiComponent } from '../contract/component.schema.js';
import type { SduiElement } from '../contract/element.schema.js';
import type { SduiGroup } from '../contract/group.schema.js';
import type { SduiSection } from '../contract/section.schema.js';
import type { SduiTemplate } from '../contract/template.schema.js';
import {
  componentRegistry,
  elementRegistry,
  groupRegistry,
  sectionRegistry,
  templateRegistry,
  type InstanceInput,
} from '../registry/registries.js';
import type { DefinitionRegistry } from '../registry/DefinitionRegistry.js';

export const PRODUCTION_SDUI_DEFINITION_TYPES = Object.freeze({
  templates: Object.freeze(['default_template', 'form_template'] as const),
  components: Object.freeze(['content_component', 'form_component'] as const),
  sections: Object.freeze(['content_section'] as const),
  groups: Object.freeze(['row_group', 'column_group'] as const),
  elements: Object.freeze(['text', 'image', 'icon', 'button', 'input', 'spacer'] as const),
});

function registerIfMissing<TOutput>(
  registry: DefinitionRegistry<InstanceInput, TOutput>,
  type: string,
  factory: (input: InstanceInput) => TOutput,
): void {
  if (!registry.has(type)) registry.register(type, factory);
}

function element(type: string, defaults: Record<string, unknown> = {}): void {
  registerIfMissing<SduiElement>(elementRegistry, type, (input) => ({
    id: input.id,
    type,
    properties: { ...defaults, ...input.properties },
    ...(input.actions ? { actions: input.actions } : {}),
    ...(input.analytics ? { analytics: input.analytics } : {}),
    ...(input.accessibility ? { accessibility: input.accessibility } : {}),
    ...(input.validation ? { validation: input.validation } : {}),
    ...(input.binding ? { binding: input.binding } : {}),
    ...(input.visibility ? { visibility: input.visibility } : {}),
    ...(input.metadata ? { metadata: input.metadata } : {}),
  }));
}

function requireElements(type: string, input: InstanceInput): SduiElement[] {
  if (!input.elements?.length) throw new Error(`SDUI definition '${type}' requires at least one element`);
  return input.elements;
}

function requireComponents(type: string, input: InstanceInput): SduiComponent[] {
  if (!input.components?.length) throw new Error(`SDUI definition '${type}' requires at least one component`);
  return input.components;
}

function sectionContent(
  type: string,
  input: InstanceInput,
): { elements: SduiElement[] } | { groups: SduiGroup[] } {
  const hasElements = Boolean(input.elements?.length);
  const hasGroups = Boolean(input.groups?.length);
  if (hasElements === hasGroups) {
    throw new Error(`SDUI definition '${type}' requires exactly one branch: elements or groups`);
  }
  return hasElements ? { elements: input.elements! } : { groups: input.groups! };
}

function componentContent(
  type: string,
  input: InstanceInput,
): { elements: SduiElement[] } | { sections: SduiSection[] } {
  const hasElements = Boolean(input.elements?.length);
  const hasSections = Boolean(input.sections?.length);
  if (hasElements === hasSections) {
    throw new Error(`SDUI definition '${type}' requires exactly one branch: elements or sections`);
  }
  return hasElements ? { elements: input.elements! } : { sections: input.sections! };
}

/** Registers the canonical, product-neutral SDUI production vocabulary. */
export function registerProductionSduiDefinitions(): void {
  element('text', { semanticRole: 'text' });
  element('image', { semanticRole: 'image' });
  element('icon', { semanticRole: 'icon' });
  element('button', { semanticRole: 'action' });
  element('input', { semanticRole: 'input' });
  element('spacer', { semanticRole: 'spacing' });

  registerIfMissing<SduiGroup>(groupRegistry, 'row_group', (input) => ({
    id: input.id,
    type: 'row_group',
    properties: { axis: 'horizontal', ...input.properties },
    elements: requireElements('row_group', input),
  }));
  registerIfMissing<SduiGroup>(groupRegistry, 'column_group', (input) => ({
    id: input.id,
    type: 'column_group',
    properties: { axis: 'vertical', ...input.properties },
    elements: requireElements('column_group', input),
  }));

  registerIfMissing<SduiSection>(sectionRegistry, 'content_section', (input) => ({
    id: input.id,
    type: 'content_section',
    properties: input.properties,
    ...sectionContent('content_section', input),
  }));

  registerIfMissing<SduiComponent>(componentRegistry, 'content_component', (input) => ({
    id: input.id,
    type: 'content_component',
    properties: input.properties,
    ...componentContent('content_component', input),
  }));
  registerIfMissing<SduiComponent>(componentRegistry, 'form_component', (input) => ({
    id: input.id,
    type: 'form_component',
    properties: { semanticRole: 'form', ...input.properties },
    ...componentContent('form_component', input),
  }));

  registerIfMissing<SduiTemplate>(templateRegistry, 'default_template', (input) => ({
    id: input.id,
    type: 'default_template',
    properties: input.properties,
    components: requireComponents('default_template', input),
  }));
  registerIfMissing<SduiTemplate>(templateRegistry, 'form_template', (input) => ({
    id: input.id,
    type: 'form_template',
    properties: { semanticRole: 'form', ...input.properties },
    components: requireComponents('form_template', input),
  }));
}

registerProductionSduiDefinitions();
