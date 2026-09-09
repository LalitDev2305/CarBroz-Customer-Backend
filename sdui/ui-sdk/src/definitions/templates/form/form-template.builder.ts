import { StackTemplateBuilder } from '../stack/stack-template.builder.js';

/** Form template reuses stack layout semantics while preserving the form_template definition identity. */
export class FormTemplateBuilder extends StackTemplateBuilder {
  constructor(id: string) {
    super(id, 'form_template');
  }
}
