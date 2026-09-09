import type { SduiComponent } from '../../../contract/component.schema.js';
import type { SduiTemplate } from '../../../contract/template.schema.js';
import { TypedPropertyBuilder } from '../../../builder/TypedPropertyBuilder.js';
import { TemplateFactory } from '../../../factory/NodeFactories.js';
import type { StackTemplateProperties } from './stack-template.properties.js';

export class StackTemplateBuilder extends TypedPropertyBuilder<StackTemplateProperties> {
  private readonly components: SduiComponent[] = [];
  private orientation: 'vertical' | 'horizontal' = 'vertical';

  constructor(private readonly id: string) { super(); }

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
  padding(value: StackTemplateProperties['padding']): this { return this.setProperty('padding', value); }
  fillMaxWidth(value = true): this { return this.setProperty('fillMaxWidth', value); }
  fillMaxHeight(value = true): this { return this.setProperty('fillMaxHeight', value); }
  fillMaxSize(value = true): this { return this.setProperty('fillMaxSize', value); }
  addComponent(component: SduiComponent): this { this.components.push(component); return this; }

  build(): SduiTemplate {
    return TemplateFactory.create('stack_template', {
      id: this.id,
      properties: this.propertiesSnapshot(),
      components: this.components,
    });
  }
}
