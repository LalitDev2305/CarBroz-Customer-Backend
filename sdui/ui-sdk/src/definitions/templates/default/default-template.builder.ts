import { StackTemplateBuilder } from '../stack/stack-template.builder.js';

/** Default template reuses stack layout semantics while preserving the default_template definition identity. */
export class DefaultTemplateBuilder extends StackTemplateBuilder {
  constructor(id: string) {
    super(id, 'default_template');
  }
}
