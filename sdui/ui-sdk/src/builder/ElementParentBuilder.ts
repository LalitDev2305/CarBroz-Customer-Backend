import type { SduiElement } from '../contract/element.schema.js';
import { ButtonBuilder } from '../definitions/elements/button/button.builder.js';
import { DividerBuilder } from '../definitions/elements/divider/divider.builder.js';
import { IconBuilder } from '../definitions/elements/icon/icon.builder.js';
import { ImageBuilder } from '../definitions/elements/image/image.builder.js';
import { InputBuilder } from '../definitions/elements/input/input.builder.js';
import { SpacerBuilder } from '../definitions/elements/spacer/spacer.builder.js';
import { TextBuilder } from '../definitions/elements/text/text.builder.js';
import { TypedPropertyBuilder } from './TypedPropertyBuilder.js';

interface ElementBuildable {
  build(): SduiElement;
}

/**
 * Reusable object-graph owner for SDUI nodes that may contain terminal Elements.
 * The parent owns child builder instances; callers never manage final elements arrays.
 */
export abstract class ElementParentBuilder<P extends object> extends TypedPropertyBuilder<P> {
  private readonly elementBuilders: ElementBuildable[] = [];

  protected beforeAddElement(): void {}

  private ownElement<T extends ElementBuildable>(builder: T): T {
    this.beforeAddElement();
    this.elementBuilders.push(builder);
    return builder;
  }

  addText(id: string, text?: string): TextBuilder {
    return this.ownElement(new TextBuilder(id, text));
  }

  addImage(id: string, source?: string): ImageBuilder {
    return this.ownElement(new ImageBuilder(id, source));
  }

  addIcon(id: string, name?: string): IconBuilder {
    return this.ownElement(new IconBuilder(id, name));
  }

  addButton(id: string, text?: string): ButtonBuilder {
    return this.ownElement(new ButtonBuilder(id, text));
  }

  addInput(id: string): InputBuilder {
    return this.ownElement(new InputBuilder(id));
  }

  addDivider(id: string): DividerBuilder {
    return this.ownElement(new DividerBuilder(id));
  }

  addSpacer(id: string): SpacerBuilder {
    return this.ownElement(new SpacerBuilder(id));
  }

  protected hasElements(): boolean {
    return this.elementBuilders.length > 0;
  }

  protected buildElements(): SduiElement[] {
    return this.elementBuilders.map((builder) => builder.build());
  }
}
