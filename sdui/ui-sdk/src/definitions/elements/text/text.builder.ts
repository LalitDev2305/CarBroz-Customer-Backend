import type { SduiElement } from '../../../contract/element.schema.js';
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
  color(value: TextProperties['color']): this { return this.setProperty('color', value); }
  textAlign(value: TextProperties['textAlign']): this { return this.setProperty('textAlign', value); }
  fillMaxWidth(value = true): this { return this.setProperty('fillMaxWidth', value); }
  leading(value: TextProperties['leading']): this { return this.setProperty('leading', value); }
  trailing(value: TextProperties['trailing']): this { return this.setProperty('trailing', value); }

  build(): SduiElement { return ElementFactory.create('text', this.elementInput()); }
}
