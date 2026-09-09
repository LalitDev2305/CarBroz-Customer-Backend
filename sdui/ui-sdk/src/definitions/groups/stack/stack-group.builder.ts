import type { SduiGroup } from '../../../contract/group.schema.js';
import { ElementParentBuilder } from '../../../builder/ElementParentBuilder.js';
import { GroupFactory } from '../../../factory/NodeFactories.js';
import type { StackGroupProperties } from './stack-group.properties.js';

export class StackGroupBuilder extends ElementParentBuilder<StackGroupProperties> {
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
  verticalAlignment(value: StackGroupProperties['verticalAlignment']): this { return this.setProperty('verticalAlignment', value); }
  horizontalAlignment(value: StackGroupProperties['horizontalAlignment']): this { return this.setProperty('horizontalAlignment', value); }
  padding(value: StackGroupProperties['padding']): this { return this.setProperty('padding', value); }
  width(value: StackGroupProperties['width']): this { return this.setProperty('width', value); }
  height(value: StackGroupProperties['height']): this { return this.setProperty('height', value); }
  maxWidth(value: StackGroupProperties['maxWidth']): this { return this.setProperty('maxWidth', value); }
  weight(value: StackGroupProperties['weight']): this { return this.setProperty('weight', value); }
  fillMaxWidth(value = true): this { return this.setProperty('fillMaxWidth', value); }
  fillMaxHeight(value = true): this { return this.setProperty('fillMaxHeight', value); }
  fillMaxSize(value = true): this { return this.setProperty('fillMaxSize', value); }
  background(value: StackGroupProperties['background']): this { return this.setProperty('background', value); }
  border(value: StackGroupProperties['border']): this { return this.setProperty('border', value); }
  shape(value: StackGroupProperties['shape']): this { return this.setProperty('shape', value); }

  build(): SduiGroup {
    return GroupFactory.create('stack_group', {
      id: this.id,
      properties: this.propertiesSnapshot(),
      elements: this.buildElements(),
    });
  }
}
