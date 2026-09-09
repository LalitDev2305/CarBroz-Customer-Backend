import type { SduiElement } from '../../../contract/element.schema.js';
import { TypedElementBuilder } from '../../../builder/TypedElementBuilder.js';
import { ElementFactory } from '../../../factory/NodeFactories.js';
import type { SpacerProperties } from './spacer.properties.js';

export class SpacerBuilder extends TypedElementBuilder<SpacerProperties> {
  constructor(id: string) { super(id); }

  width(value: SpacerProperties['width']): this { return this.setProperty('width', value); }
  height(value: SpacerProperties['height']): this { return this.setProperty('height', value); }
  weight(value: SpacerProperties['weight']): this { return this.setProperty('weight', value); }

  build(): SduiElement { return ElementFactory.create('spacer', this.elementInput()); }
}
