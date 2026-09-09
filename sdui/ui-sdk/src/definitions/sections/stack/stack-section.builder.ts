import type { SduiSection } from '../../../contract/section.schema.js';
import { ElementParentBuilder } from '../../../builder/ElementParentBuilder.js';
import { SectionFactory } from '../../../factory/NodeFactories.js';
import { StackGroupBuilder } from '../../groups/stack/stack-group.builder.js';
import type { StackSectionProperties } from './stack-section.properties.js';

export class StackSectionBuilder extends ElementParentBuilder<StackSectionProperties> {
  private readonly groupBuilders: StackGroupBuilder[] = [];
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
  horizontalAlignment(value: StackSectionProperties['horizontalAlignment']): this { return this.setProperty('horizontalAlignment', value); }
  verticalAlignment(value: StackSectionProperties['verticalAlignment']): this { return this.setProperty('verticalAlignment', value); }
  padding(value: StackSectionProperties['padding']): this { return this.setProperty('padding', value); }
  width(value: StackSectionProperties['width']): this { return this.setProperty('width', value); }
  height(value: StackSectionProperties['height']): this { return this.setProperty('height', value); }
  maxWidth(value: StackSectionProperties['maxWidth']): this { return this.setProperty('maxWidth', value); }
  weight(value: StackSectionProperties['weight']): this { return this.setProperty('weight', value); }
  fillMaxWidth(value = true): this { return this.setProperty('fillMaxWidth', value); }
  fillMaxHeight(value = true): this { return this.setProperty('fillMaxHeight', value); }
  fillMaxSize(value = true): this { return this.setProperty('fillMaxSize', value); }
  background(value: StackSectionProperties['background']): this { return this.setProperty('background', value); }
  border(value: StackSectionProperties['border']): this { return this.setProperty('border', value); }
  shape(value: StackSectionProperties['shape']): this { return this.setProperty('shape', value); }

  protected override beforeAddElement(): void {
    if (this.groupBuilders.length > 0) {
      throw new Error('StackSectionBuilder cannot contain both elements and groups');
    }
  }

  addStackGroup(id: string): StackGroupBuilder {
    if (this.hasElements()) throw new Error('StackSectionBuilder cannot contain both elements and groups');
    const group = new StackGroupBuilder(id);
    this.groupBuilders.push(group);
    return group;
  }

  build(): SduiSection {
    const content = this.groupBuilders.length > 0
      ? { groups: this.groupBuilders.map((builder) => builder.build()) }
      : { elements: this.buildElements() };

    return SectionFactory.create('stack_section', {
      id: this.id,
      properties: this.propertiesSnapshot(),
      ...content,
    });
  }
}
