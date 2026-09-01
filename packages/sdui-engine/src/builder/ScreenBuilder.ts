import { screenSchema, type SduiScreen, type SduiTheme } from '../contract/screen.schema.js';
import type { SduiTemplate } from '../contract/template.schema.js';

export interface ScreenBuilderInput {
  screenId: string;
  schemaVersion: string;
  targetApp: 'CUSTOMER' | 'PARTNER' | 'ADMIN';
  metadata?: Record<string, unknown>;
}

export class ScreenBuilder {
  private template?: SduiTemplate;
  private theme?: SduiTheme;

  constructor(private readonly input: ScreenBuilderInput) {}

  withTemplate(template: SduiTemplate): this { this.template = template; return this; }
  withTheme(theme: SduiTheme): this { this.theme = theme; return this; }

  build(): SduiScreen {
    if (!this.template) throw new Error('Screen requires exactly one template');
    return screenSchema.parse({
      ...this.input,
      templateId: this.template.id,
      templateType: this.template.type,
      template: this.template,
      ...(this.theme ? { theme: this.theme } : {}),
    });
  }
}
