import type { SduiElement } from '../contract/element.schema.js';
import type { InstanceInput } from '../registry/registries.js';
import { TypedPropertyBuilder } from './TypedPropertyBuilder.js';

export abstract class TypedElementBuilder<P extends object> extends TypedPropertyBuilder<P> {
  private actions?: SduiElement['actions'];
  private analytics?: SduiElement['analytics'];
  private accessibility?: SduiElement['accessibility'];
  private validation?: SduiElement['validation'];
  private binding?: SduiElement['binding'];
  private visibility?: SduiElement['visibility'];
  private metadata?: SduiElement['metadata'];

  protected constructor(protected readonly id: string) { super(); }

  withActions(actions: SduiElement['actions']): this { this.actions = actions; return this; }
  withAnalytics(analytics: SduiElement['analytics']): this { this.analytics = analytics; return this; }
  withAccessibility(accessibility: SduiElement['accessibility']): this { this.accessibility = accessibility; return this; }
  withValidation(validation: SduiElement['validation']): this { this.validation = validation; return this; }
  bind(key: string): this { this.binding = { key }; return this; }
  withVisibility(visibility: SduiElement['visibility']): this { this.visibility = visibility; return this; }
  withMetadata(metadata: SduiElement['metadata']): this { this.metadata = metadata; return this; }

  protected elementInput(): InstanceInput {
    return {
      id: this.id,
      properties: this.propertiesSnapshot(),
      ...(this.actions ? { actions: this.actions } : {}),
      ...(this.analytics ? { analytics: this.analytics } : {}),
      ...(this.accessibility ? { accessibility: this.accessibility } : {}),
      ...(this.validation ? { validation: this.validation } : {}),
      ...(this.binding ? { binding: this.binding } : {}),
      ...(this.visibility ? { visibility: this.visibility } : {}),
      ...(this.metadata ? { metadata: this.metadata } : {}),
    };
  }
}
