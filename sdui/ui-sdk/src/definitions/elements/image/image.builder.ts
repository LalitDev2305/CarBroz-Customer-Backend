import type { SduiElement } from '../../../contract/element.schema.js';
import { TypedElementBuilder } from '../../../builder/TypedElementBuilder.js';
import { ElementFactory } from '../../../factory/NodeFactories.js';
import type { ImageProperties } from './image.properties.js';

export class ImageBuilder extends TypedElementBuilder<ImageProperties> {
  constructor(id: string, url?: string) {
    super(id);
    if (url !== undefined) this.source(url);
  }

  source(url: string): this { return this.setProperty('url', url); }
  width(value: ImageProperties['width']): this { return this.setProperty('width', value); }
  height(value: ImageProperties['height']): this { return this.setProperty('height', value); }
  maxWidth(value: ImageProperties['maxWidth']): this { return this.setProperty('maxWidth', value); }
  maxHeight(value: ImageProperties['maxHeight']): this { return this.setProperty('maxHeight', value); }
  fillMaxWidth(value = true): this { return this.setProperty('fillMaxWidth', value); }
  fillMaxHeight(value = true): this { return this.setProperty('fillMaxHeight', value); }
  contentScale(value: ImageProperties['contentScale']): this { return this.setProperty('contentScale', value); }

  build(): SduiElement { return ElementFactory.create('image', this.elementInput()); }
}
