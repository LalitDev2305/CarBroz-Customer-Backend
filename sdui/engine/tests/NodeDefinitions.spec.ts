import { describe, expect, it } from 'vitest';
import {
  DuplicateNodeDefinitionError,
  NodeDefinitionRegistry,
  UnknownNodeDefinitionError,
  createProductionNodeDefinitionRegistry,
} from '../src/index.js';
import { StackComponentDefinition } from '../src/nodes/component/StackComponent.js';
import { TextDefinition } from '../src/nodes/element/Text.js';
import { StackGroupDefinition } from '../src/nodes/group/StackGroup.js';
import { StackSectionDefinition } from '../src/nodes/section/StackSection.js';
import { StackTemplateDefinition } from '../src/nodes/template/StackTemplate.js';

describe('NodeDefinitionRegistry', () => {
  it('resolves the canonical production vocabulary', () => {
    const registry = createProductionNodeDefinitionRegistry();

    expect(registry.get('template', 'stack_template')).toBe(StackTemplateDefinition);
    expect(registry.get('component', 'stack_component')).toBe(StackComponentDefinition);
    expect(registry.get('section', 'stack_section')).toBe(StackSectionDefinition);
    expect(registry.get('group', 'stack_group')).toBe(StackGroupDefinition);
    expect(registry.get('element', 'text')).toBe(TextDefinition);
  });

  it('rejects duplicate definitions at the same level and type', () => {
    const registry = new NodeDefinitionRegistry([TextDefinition]);
    expect(() => registry.register(TextDefinition)).toThrow(DuplicateNodeDefinitionError);
  });

  it('rejects unknown definitions', () => {
    const registry = new NodeDefinitionRegistry();
    expect(() => registry.get('element', 'missing')).toThrow(UnknownNodeDefinitionError);
  });
});

describe('co-located node contracts', () => {
  it('exposes the frozen structural child modes', () => {
    expect(StackTemplateDefinition.children).toBe('components');
    expect(StackComponentDefinition.children).toBe('elements-or-sections');
    expect(StackSectionDefinition.children).toBe('elements-or-groups');
    expect(StackGroupDefinition.children).toBe('elements');
    expect(TextDefinition.children).toBe('none');
  });

  it('keeps production properties strict', () => {
    expect(() =>
      StackComponentDefinition.properties.parse({ orientation: 'vertical', unknownField: true }),
    ).toThrow();
  });

  it('requires text content for text elements', () => {
    expect(() => TextDefinition.properties.parse({})).toThrow();
    expect(TextDefinition.properties.parse({ text: 'CarBroz' })).toEqual({ text: 'CarBroz' });
  });
});
