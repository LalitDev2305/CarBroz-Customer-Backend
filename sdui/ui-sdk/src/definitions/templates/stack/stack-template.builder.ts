import type { SduiTemplate } from '../../../contract/template.schema.js';
import { TypedPropertyBuilder } from '../../../builder/TypedPropertyBuilder.js';
import { TemplateFactory } from '../../../factory/NodeFactories.js';
import { StackComponentBuilder } from '../../components/stack/stack-component.builder.js';
import type { StackTemplateProperties } from './stack-template.properties.js';

export type StackLikeTemplateType = 'stack_template' | 'form_template' | 'default_template';

export class StackTemplateBuilder extends TypedPropertyBuilder<StackTemplateProperties> {
  private readonly componentBuilders: StackComponentBuilder[] = [];
  private orientation: 'vertical' | 'horizontal' = 'vertical';

  constructor(
    private readonly id: string,
    private readonly definitionType: StackLikeTemplateType = 'stack_template',
  ) { super(); }

  vertical(): this { this.orientation = 'vertical'; return this.setProperty('orientation', 'vertical'); }
  horizontal(): this { this.orientation = 'horizontal'; return this.setProperty('orientation', 'horizontal'); }
  spacing(value: number): this {
    return this.orientation === 'vertical'
      ? this.setProperty('verticalArrangement', { type: 'spacedBy', spacing: value })
      : this.setProperty('horizontalArrangement', { type: 'spacedBy', spacing: value });
  }
  alignCenter(): this {
    return this.orientation === 'vertical'
      ? this.setProperty('horizontalAlignment', 'center')
      : this.setProperty('verticalAlignment', 'center');
  }
  horizontalAlignment(value: StackTemplateProperties['horizontalAlignment']): this { return this.setProperty('horizontalAlignment', value); }
  verticalAlignment(value: StackTemplateProperties['verticalAlignment']): this { return this.setProperty('verticalAlignment', value); }
  padding(value: StackTemplateProperties['padding']): this { return this.setProperty('padding', value); }
  width(value: StackTemplateProperties['width']): this { return this.setProperty('width', value); }
  height(value: StackTemplateProperties['height']): this { return this.setProperty('height', value); }
  maxWidth(value: StackTemplateProperties['maxWidth']): this { return this.setProperty('maxWidth', value); }
  fillMaxWidth(value = true): this { return this.setProperty('fillMaxWidth', value); }
  fillMaxHeight(value = true): this { return this.setProperty('fillMaxHeight', value); }
  fillMaxSize(value = true): this { return this.setProperty('fillMaxSize', value); }
  background(value: StackTemplateProperties['background']): this { return this.setProperty('background', value); }
  border(value: StackTemplateProperties['border']): this { return this.setProperty('border', value); }
  shape(value: StackTemplateProperties['shape']): this { return this.setProperty('shape', value); }

  addStackComponent(id: string): StackComponentBuilder {
    const component = new StackComponentBuilder(id);
    this.componentBuilders.push(component);
    return component;
  }

  build(): SduiTemplate {
    return TemplateFactory.create(this.definitionType, {
      id: this.id,
      properties: this.propertiesSnapshot(),
      components: this.componentBuilders.map((builder) => builder.build()),
    });
  }
}
