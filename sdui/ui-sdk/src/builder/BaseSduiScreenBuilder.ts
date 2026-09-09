import type { SduiTargetApp } from '../contract/common.schema.js';
import type { SduiScreen, SduiTheme } from '../contract/screen.schema.js';
import type { SduiTemplate } from '../contract/template.schema.js';
import { DefaultTemplateBuilder } from '../definitions/templates/default/default-template.builder.js';
import { FormTemplateBuilder } from '../definitions/templates/form/form-template.builder.js';
import { StackTemplateBuilder } from '../definitions/templates/stack/stack-template.builder.js';
import { parseSduiScreen } from '../validator/validate-screen.js';

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
 * Canonical Screen owner for SDUI object-graph composition.
 * A Screen owns exactly one Template builder; the Template recursively owns the rest of the tree.
 */
export class BaseSduiScreenBuilder {
  private templateBuilder?: TemplateBuildable;
  private builtTemplate?: SduiTemplate;
  private theme?: SduiTheme;

  constructor(protected readonly input: ScreenBuilderInput) {}

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

  withTheme(theme: SduiTheme): this {
    this.theme = theme;
    return this;
  }

  /** Compatibility hook for the pre-object-graph ScreenBuilder API only. */
  protected withBuiltTemplate(template: SduiTemplate): this {
    this.assertTemplateAvailable();
    this.builtTemplate = template;
    return this;
  }

  build(): SduiScreen {
    const template = this.templateBuilder?.build() ?? this.builtTemplate;
    if (!template) throw new Error('SduiScreen requires exactly one template');

    return parseSduiScreen({
      screenId: this.input.screenId,
      schemaVersion: this.input.schemaVersion,
      targetApp: this.input.targetApp,
      ...(this.theme ? { theme: this.theme } : {}),
      ...(this.input.metadata ? { metadata: this.input.metadata } : {}),
      template,
    });
  }
}
