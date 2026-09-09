import type { SduiTemplate } from '../contract/template.schema.js';
import { BaseSduiScreenBuilder, type ScreenBuilderInput } from './BaseSduiScreenBuilder.js';

/**
 * Backward-compatible facade for callers that already own a built Template.
 * New screen composition must use BaseSduiScreenBuilder's parent-owned object graph methods.
 */
export class ScreenBuilder extends BaseSduiScreenBuilder {
  constructor(input: ScreenBuilderInput) {
    super(input);
  }

  withTemplate(template: SduiTemplate): this {
    return this.withBuiltTemplate(template);
  }
}
