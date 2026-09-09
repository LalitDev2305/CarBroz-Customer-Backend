import type { SduiElement } from '../../../contract/element.schema.js';
import type { SduiGroup } from '../../../contract/group.schema.js';
import type { SduiSection } from '../../../contract/section.schema.js';
import { TypedPropertyBuilder } from '../../../builder/TypedPropertyBuilder.js';
import { SectionFactory } from '../../../factory/NodeFactories.js';
import type { StackSectionProperties } from './stack-section.properties.js';

export class StackSectionBuilder extends TypedPropertyBuilder<StackSectionProperties> {
  private readonly elements: SduiElement[] = [];
  private readonly groups: SduiGroup[] = [];
  private orientation: 'vertical' | 'horizontal' = 'vertical';

  constructor(private readonly id: string) { super(); }

  vertical(): this { this.orientation = 'vertical'; return this.setProperty('orientation', 'vertical'); }
  horizontal(): this { this.orientation = 'horizontal'; return this.setProperty('orientation', 'horizontal'); }
  spacing(value: number): this {
    return this.orientation === 'vertical'
      ? this.setProperty('verticalArrangement', { type: 'spacedBy', spacing: value })
      : this.setProperty('horizontalArrangement', { type: 'spacedBy', spacing: value });
  }
  alignCenter(): this {
    return this.orientation === 'vertical'
      ? this.setProperty('horizontalAlignment', 'center')
      : this.setProperty('verticalAlignment', 'center');
  }
  padding(value: StackSectionProperties['padding']): this { return this.setProperty('padding', value); }
  fillMaxWidth(value = true): this { return this.setProperty('fillMaxWidth', value); }
  fillMaxHeight(value = true): this { return this.setProperty('fillMaxHeight', value); }
  fillMaxSize(value = true): this { return this.setProperty('fillMaxSize', value); }

  addElement(element: SduiElement): this {
    if (this.groups.length) throw new Error('StackSectionBuilder cannot contain both elements and groups');
    this.elements.push(element);
    return this;
  }

  addGroup(group: SduiGroup): this {
    if (this.elements.length) throw new Error('StackSectionBuilder cannot contain both elements and groups');
    this.groups.push(group);
    return this;
  }

  build(): SduiSection {
    const content = this.groups.length ? { groups: this.groups } : { elements: this.elements };
    return SectionFactory.create('stack_section', {
      id: this.id,
      properties: this.propertiesSnapshot(),
      ...content,
    });
  }
}
