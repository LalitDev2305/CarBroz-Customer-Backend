import type { SduiElement } from '../../../contract/element.schema.js';
import { TypedElementBuilder } from '../../../builder/TypedElementBuilder.js';
import { ElementFactory } from '../../../factory/NodeFactories.js';
import type { ImageProperties } from './image.properties.js';

export class ImageBuilder extends TypedElementBuilder<ImageProperties> {
  constructor(id: string, source?: string) {
    super(id);
    if (source !== undefined) this.source(source);
  }

  source(value: string): this { return this.setProperty('url', value); }
  width(value: ImageProperties['width']): this { return this.setProperty('width', value); }
  height(value: ImageProperties['height']): this { return this.setProperty('height', value); }
  size(width: ImageProperties['width'], height: ImageProperties['height']): this {
    this.setProperty('width', width);
    return this.setProperty('height', height);
  }
  minWidth(value: ImageProperties['minWidth']): this { return this.setProperty('minWidth', value); }
  minHeight(value: ImageProperties['minHeight']): this { return this.setProperty('minHeight', value); }
  maxWidth(value: ImageProperties['maxWidth']): this { return this.setProperty('maxWidth', value); }
  maxHeight(value: ImageProperties['maxHeight']): this { return this.setProperty('maxHeight', value); }
  contentScale(value: ImageProperties['contentScale']): this { return this.setProperty('contentScale', value); }
  fillMaxWidth(value = true): this { return this.setProperty('fillMaxWidth', value); }
  fillMaxHeight(value = true): this { return this.setProperty('fillMaxHeight', value); }

  build(): SduiElement { return ElementFactory.create('image', this.elementInput()); }
}
