import type { SduiElement } from '../../../contract/element.schema.js';
import { TypedElementBuilder } from '../../../builder/TypedElementBuilder.js';
import { ElementFactory } from '../../../factory/NodeFactories.js';
import type { IconProperties } from './icon.properties.js';

export class IconBuilder extends TypedElementBuilder<IconProperties> {
  constructor(id: string, name?: string) {
    super(id);
    if (name !== undefined) this.name(name);
  }

  name(value: string): this { return this.setProperty('name', value); }
  size(value: IconProperties['size']): this { return this.setProperty('size', value); }
  color(value: IconProperties['color']): this { return this.setProperty('color', value); }

  build(): SduiElement { return ElementFactory.create('icon', this.elementInput()); }
}
