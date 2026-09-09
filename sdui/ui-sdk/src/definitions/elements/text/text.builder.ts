import type { SduiElement } from '../../../contract/element.schema.js';
import type { Accessory } from '../../../properties/accessory/accessory.schema.js';
import { TypedElementBuilder } from '../../../builder/TypedElementBuilder.js';
import { ElementFactory } from '../../../factory/NodeFactories.js';
import type { TextProperties } from './text.properties.js';

export class TextBuilder extends TypedElementBuilder<TextProperties> {
  constructor(id: string, text?: string) {
    super(id);
    if (text !== undefined) this.value(text);
  }

  value(text: string): this { return this.setProperty('text', text); }
  fontSize(value: number): this { return this.setProperty('fontSize', value); }
  fontWeight(value: number): this { return this.setProperty('fontWeight', value); }
  bold(): this { return this.setProperty('fontWeight', 700); }
  lineHeight(value: number): this { return this.setProperty('lineHeight', value); }
  letterSpacing(value: number): this { return this.setProperty('letterSpacing', value); }
  color(value: TextProperties['color']): this { return this.setProperty('color', value); }
  textAlign(value: TextProperties['textAlign']): this { return this.setProperty('textAlign', value); }
  width(value: TextProperties['width']): this { return this.setProperty('width', value); }
  height(value: TextProperties['height']): this { return this.setProperty('height', value); }
  maxWidth(value: TextProperties['maxWidth']): this { return this.setProperty('maxWidth', value); }
  weight(value: TextProperties['weight']): this { return this.setProperty('weight', value); }
  fillMaxWidth(value = true): this { return this.setProperty('fillMaxWidth', value); }
  leading(value: TextProperties['leading']): this { return this.setProperty('leading', value); }
  trailing(value: TextProperties['trailing']): this { return this.setProperty('trailing', value); }
  leadingDivider(properties: Accessory['properties']): this { return this.leading([{ type: 'divider', properties }]); }
  trailingDivider(properties: Accessory['properties']): this { return this.trailing([{ type: 'divider', properties }]); }

  build(): SduiElement { return ElementFactory.create('text', this.elementInput()); }
}
