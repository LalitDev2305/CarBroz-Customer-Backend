import type { SduiComponent } from '../../../contract/component.schema.js';
import type { SduiElement } from '../../../contract/element.schema.js';
import type { SduiSection } from '../../../contract/section.schema.js';
import { TypedPropertyBuilder } from '../../../builder/TypedPropertyBuilder.js';
import { ComponentFactory } from '../../../factory/NodeFactories.js';
import type { StackComponentProperties } from './stack-component.properties.js';

export class StackComponentBuilder extends TypedPropertyBuilder<StackComponentProperties> {
  private readonly elements: SduiElement[] = [];
  private readonly sections: SduiSection[] = [];
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
  padding(value: StackComponentProperties['padding']): this { return this.setProperty('padding', value); }
  fillMaxWidth(value = true): this { return this.setProperty('fillMaxWidth', value); }
  fillMaxHeight(value = true): this { return this.setProperty('fillMaxHeight', value); }
  fillMaxSize(value = true): this { return this.setProperty('fillMaxSize', value); }

  addElement(element: SduiElement): this {
    if (this.sections.length) throw new Error('StackComponentBuilder cannot contain both elements and sections');
    this.elements.push(element);
    return this;
  }

  addSection(section: SduiSection): this {
    if (this.elements.length) throw new Error('StackComponentBuilder cannot contain both elements and sections');
    this.sections.push(section);
    return this;
  }

  build(): SduiComponent {
    const content = this.sections.length ? { sections: this.sections } : { elements: this.elements };
    return ComponentFactory.create('stack_component', {
      id: this.id,
      properties: this.propertiesSnapshot(),
      ...content,
    });
  }
}
