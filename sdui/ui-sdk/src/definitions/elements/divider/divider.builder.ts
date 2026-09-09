import type { SduiElement } from '../../../contract/element.schema.js';
import { TypedElementBuilder } from '../../../builder/TypedElementBuilder.js';
import { ElementFactory } from '../../../factory/NodeFactories.js';
import type { DividerProperties } from './divider.properties.js';

export class DividerBuilder extends TypedElementBuilder<DividerProperties> {
  constructor(id: string) { super(id); }

  vertical(): this { return this.setProperty('orientation', 'vertical'); }
  horizontal(): this { return this.setProperty('orientation', 'horizontal'); }
  width(value: DividerProperties['width']): this { return this.setProperty('width', value); }
  height(value: DividerProperties['height']): this { return this.setProperty('height', value); }
  thickness(value: number): this { return this.setProperty('thickness', value); }
  color(value: DividerProperties['color']): this { return this.setProperty('color', value); }

  build(): SduiElement { return ElementFactory.create('divider', this.elementInput()); }
}
