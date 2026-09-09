import type { SduiElement } from '../../../contract/element.schema.js';
import type { SduiGroup } from '../../../contract/group.schema.js';
import { TypedPropertyBuilder } from '../../../builder/TypedPropertyBuilder.js';
import { GroupFactory } from '../../../factory/NodeFactories.js';
import type { StackGroupProperties } from './stack-group.properties.js';

export class StackGroupBuilder extends TypedPropertyBuilder<StackGroupProperties> {
  private readonly elements: SduiElement[] = [];
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
  padding(value: StackGroupProperties['padding']): this { return this.setProperty('padding', value); }
  fillMaxWidth(value = true): this { return this.setProperty('fillMaxWidth', value); }
  fillMaxHeight(value = true): this { return this.setProperty('fillMaxHeight', value); }
  fillMaxSize(value = true): this { return this.setProperty('fillMaxSize', value); }

  addElement(element: SduiElement): this { this.elements.push(element); return this; }

  build(): SduiGroup {
    return GroupFactory.create('stack_group', {
      id: this.id,
      properties: this.propertiesSnapshot(),
      elements: this.elements,
    });
  }
}
