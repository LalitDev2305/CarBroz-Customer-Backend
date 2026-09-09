import type { SduiComponent } from '../../contract/component.schema.js';
import type { SduiTemplate } from '../../contract/template.schema.js';
import { templateRegistry, type InstanceInput } from '../../registry/registries.js';
import { defaultTemplatePropertiesSchema } from './default/default-template.properties.js';
import { formTemplatePropertiesSchema } from './form/form-template.properties.js';
import { stackTemplatePropertiesSchema } from './stack/stack-template.properties.js';

export const PRODUCTION_TEMPLATE_TYPES = Object.freeze(['default_template', 'form_template', 'stack_template'] as const);

type PropertySchema = { parse(input: unknown): unknown };

function requireComponents(type: string, input: InstanceInput): SduiComponent[] {
  if (!input.components?.length) throw new Error(`SDUI definition '${type}' requires at least one component`);
  return input.components;
}

function registerTemplate(
  type: string,
  schema: PropertySchema,
  defaults: Record<string, unknown> = {},
): void {
  if (templateRegistry.has(type)) return;
  templateRegistry.register(type, (input: InstanceInput): SduiTemplate => ({
    id: input.id,
    type,
    properties: schema.parse({ ...defaults, ...(input.properties ?? {}) }) as Record<string, unknown>,
    components: requireComponents(type, input),
  }));
}

export function registerProductionTemplateDefinitions(): void {
  registerTemplate('default_template', defaultTemplatePropertiesSchema);
  registerTemplate('form_template', formTemplatePropertiesSchema, { semanticRole: 'form' });
  registerTemplate('stack_template', stackTemplatePropertiesSchema, { orientation: 'vertical' });
}
