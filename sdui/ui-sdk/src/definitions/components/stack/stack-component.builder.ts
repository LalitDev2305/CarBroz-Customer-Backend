import type { SduiComponent } from '../../../contract/component.schema.js';
import { ElementParentBuilder } from '../../../builder/ElementParentBuilder.js';
import { ComponentFactory } from '../../../factory/NodeFactories.js';
import { StackSectionBuilder } from '../../sections/stack/stack-section.builder.js';
import type { StackComponentProperties } from './stack-component.properties.js';

export class StackComponentBuilder extends ElementParentBuilder<StackComponentProperties> {
  private readonly sectionBuilders: StackSectionBuilder[] = [];
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
  horizontalAlignment(value: StackComponentProperties['horizontalAlignment']): this { return this.setProperty('horizontalAlignment', value); }
  verticalAlignment(value: StackComponentProperties['verticalAlignment']): this { return this.setProperty('verticalAlignment', value); }
  padding(value: StackComponentProperties['padding']): this { return this.setProperty('padding', value); }
  width(value: StackComponentProperties['width']): this { return this.setProperty('width', value); }
  height(value: StackComponentProperties['height']): this { return this.setProperty('height', value); }
  maxWidth(value: StackComponentProperties['maxWidth']): this { return this.setProperty('maxWidth', value); }
  weight(value: StackComponentProperties['weight']): this { return this.setProperty('weight', value); }
  fillMaxWidth(value = true): this { return this.setProperty('fillMaxWidth', value); }
  fillMaxHeight(value = true): this { return this.setProperty('fillMaxHeight', value); }
  fillMaxSize(value = true): this { return this.setProperty('fillMaxSize', value); }
  background(value: StackComponentProperties['background']): this { return this.setProperty('background', value); }
  border(value: StackComponentProperties['border']): this { return this.setProperty('border', value); }
  shape(value: StackComponentProperties['shape']): this { return this.setProperty('shape', value); }

  protected override beforeAddElement(): void {
    if (this.sectionBuilders.length > 0) {
      throw new Error('StackComponentBuilder cannot contain both elements and sections');
    }
  }

  addStackSection(id: string): StackSectionBuilder {
    if (this.hasElements()) throw new Error('StackComponentBuilder cannot contain both elements and sections');
    const section = new StackSectionBuilder(id);
    this.sectionBuilders.push(section);
    return section;
  }

  build(): SduiComponent {
    const content = this.sectionBuilders.length > 0
      ? { sections: this.sectionBuilders.map((builder) => builder.build()) }
      : { elements: this.buildElements() };

    return ComponentFactory.create('stack_component', {
      id: this.id,
      properties: this.propertiesSnapshot(),
      ...content,
    });
  }
}
