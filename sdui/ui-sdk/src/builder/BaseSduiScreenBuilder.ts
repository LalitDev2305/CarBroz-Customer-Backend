import type { SduiTargetApp } from '../contract/common.schema.js';
import type { SduiScreen, SduiTheme } from '../contract/screen.schema.js';
import type { SduiTemplate } from '../contract/template.schema.js';
import { DefaultTemplateBuilder } from '../definitions/templates/default/default-template.builder.js';
import { FormTemplateBuilder } from '../definitions/templates/form/form-template.builder.js';
import { StackTemplateBuilder } from '../definitions/templates/stack/stack-template.builder.js';
import { parseSduiScreen } from '../validator/validate-screen.js';
import { SduiThemeBuilder } from './ThemeBuilder.js';

export interface ScreenBuilderInput {
  screenId: string;
  schemaVersion: string;
  targetApp: SduiTargetApp;
  metadata?: Record<string, unknown>;
}

interface TemplateBuildable {
  build(): SduiTemplate;
}

/**
 * Canonical Screen object-graph owner.
 *
 * New production composition uses the no-argument SduiScreenBuilder facade and configures
 * identity/version/target through fluent methods. The optional constructor input remains only
 * as a compatibility boundary for existing callers while they converge.
 */
export class BaseSduiScreenBuilder {
  private templateBuilder?: TemplateBuildable;
  private builtTemplate?: SduiTemplate;
  private rawTheme?: SduiTheme;
  private themeBuilder?: SduiThemeBuilder;
  private screenIdValue?: string;
  private schemaVersionValue?: string;
  private targetAppValue?: SduiTargetApp;
  private metadataValue?: Record<string, unknown>;

  constructor(input?: ScreenBuilderInput) {
    if (input) {
      this.screenIdValue = input.screenId;
      this.schemaVersionValue = input.schemaVersion;
      this.targetAppValue = input.targetApp;
      this.metadataValue = input.metadata;
    }
  }

  id(value: string): this {
    this.screenIdValue = value;
    return this;
  }

  schemaVersion(value: string): this {
    this.schemaVersionValue = value;
    return this;
  }

  targetApp(value: SduiTargetApp): this {
    this.targetAppValue = value;
    return this;
  }

  withMetadata(metadata: Record<string, unknown>): this {
    this.metadataValue = metadata;
    return this;
  }

  theme(): SduiThemeBuilder {
    this.rawTheme = undefined;
    if (!this.themeBuilder) this.themeBuilder = new SduiThemeBuilder();
    return this.themeBuilder;
  }

  private assertTemplateAvailable(): void {
    if (this.templateBuilder || this.builtTemplate) {
      throw new Error('SduiScreen requires exactly one template');
    }
  }

  addStackTemplate(id: string): StackTemplateBuilder {
    this.assertTemplateAvailable();
    const builder = new StackTemplateBuilder(id);
    this.templateBuilder = builder;
    return builder;
  }

  addFormTemplate(id: string): FormTemplateBuilder {
    this.assertTemplateAvailable();
    const builder = new FormTemplateBuilder(id);
    this.templateBuilder = builder;
    return builder;
  }

  addDefaultTemplate(id: string): DefaultTemplateBuilder {
    this.assertTemplateAvailable();
    const builder = new DefaultTemplateBuilder(id);
    this.templateBuilder = builder;
    return builder;
  }

  /** Compatibility hook for callers that still provide the canonical serialized theme. */
  withTheme(theme: SduiTheme): this {
    this.themeBuilder = undefined;
    this.rawTheme = theme;
    return this;
  }

  /** Compatibility hook for the pre-object-graph ScreenBuilder API only. */
  protected withBuiltTemplate(template: SduiTemplate): this {
    this.assertTemplateAvailable();
    this.builtTemplate = template;
    return this;
  }

  build(): SduiScreen {
    if (!this.screenIdValue) throw new Error('SduiScreen requires screen id');
    if (!this.schemaVersionValue) throw new Error('SduiScreen requires schema version');
    if (!this.targetAppValue) throw new Error('SduiScreen requires target app');

    const template = this.templateBuilder?.build() ?? this.builtTemplate;
    if (!template) throw new Error('SduiScreen requires exactly one template');

    const theme = this.themeBuilder?.build() ?? this.rawTheme;

    return parseSduiScreen({
      screenId: this.screenIdValue,
      schemaVersion: this.schemaVersionValue,
      targetApp: this.targetAppValue,
      ...(theme ? { theme } : {}),
      ...(this.metadataValue ? { metadata: this.metadataValue } : {}),
      template,
    });
  }
}
