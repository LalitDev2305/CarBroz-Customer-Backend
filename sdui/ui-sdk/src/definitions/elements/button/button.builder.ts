import type { SduiElement } from '../../../contract/element.schema.js';
import type { Accessory } from '../../../properties/accessory/accessory.schema.js';
import { TypedElementBuilder } from '../../../builder/TypedElementBuilder.js';
import { ElementFactory } from '../../../factory/NodeFactories.js';
import type { ButtonProperties } from './button.properties.js';

export class ButtonBuilder extends TypedElementBuilder<ButtonProperties> {
  constructor(id: string, text?: string) {
    super(id);
    if (text !== undefined) this.text(text);
  }

  text(value: string): this { return this.setProperty('text', value); }
  width(value: ButtonProperties['width']): this { return this.setProperty('width', value); }
  height(value: ButtonProperties['height']): this { return this.setProperty('height', value); }
  fillMaxWidth(value = true): this { return this.setProperty('fillMaxWidth', value); }
  fontSize(value: number): this { return this.setProperty('fontSize', value); }
  fontWeight(value: number): this { return this.setProperty('fontWeight', value); }
  textColor(value: ButtonProperties['textColor']): this { return this.setProperty('textColor', value); }
  background(value: ButtonProperties['background']): this { return this.setProperty('background', value); }
  shape(value: ButtonProperties['shape']): this { return this.setProperty('shape', value); }
  leading(value: ButtonProperties['leading']): this { return this.setProperty('leading', value); }
  trailing(value: ButtonProperties['trailing']): this { return this.setProperty('trailing', value); }
  leadingIcon(properties: Accessory['properties']): this { return this.leading([{ type: 'icon', properties }]); }
  trailingIcon(properties: Accessory['properties']): this { return this.trailing([{ type: 'icon', properties }]); }

  build(): SduiElement { return ElementFactory.create('button', this.elementInput()); }
}
