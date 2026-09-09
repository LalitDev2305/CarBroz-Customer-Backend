import type { SduiElement } from '../../../contract/element.schema.js';
import { TypedElementBuilder } from '../../../builder/TypedElementBuilder.js';
import { ElementFactory } from '../../../factory/NodeFactories.js';
import type { InputProperties } from './input.properties.js';

export class InputBuilder extends TypedElementBuilder<InputProperties> {
  constructor(id: string) { super(id); }

  placeholder(value: string): this { return this.setProperty('placeholder', value); }
  keyboard(value: InputProperties['keyboardType']): this { return this.setProperty('keyboardType', value); }
  phone(): this { return this.setProperty('keyboardType', 'phone'); }
  number(): this { return this.setProperty('keyboardType', 'number'); }
  maxLength(value: number): this { return this.setProperty('maxLength', value); }
  width(value: InputProperties['width']): this { return this.setProperty('width', value); }
  height(value: InputProperties['height']): this { return this.setProperty('height', value); }
  weight(value: InputProperties['weight']): this { return this.setProperty('weight', value); }
  fillMaxWidth(value = true): this { return this.setProperty('fillMaxWidth', value); }
  textAlign(value: InputProperties['textAlign']): this { return this.setProperty('textAlign', value); }
  background(value: InputProperties['background']): this { return this.setProperty('background', value); }
  border(value: InputProperties['border']): this { return this.setProperty('border', value); }
  shape(value: InputProperties['shape']): this { return this.setProperty('shape', value); }

  build(): SduiElement { return ElementFactory.create('input', this.elementInput()); }
}
