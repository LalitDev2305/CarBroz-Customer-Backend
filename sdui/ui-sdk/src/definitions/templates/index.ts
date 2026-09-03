import type { SduiComponent } from '../../contract/component.schema.js';
import type { SduiTemplate } from '../../contract/template.schema.js';
import { templateRegistry, type InstanceInput } from '../../registry/registries.js';

export const PRODUCTION_TEMPLATE_TYPES = Object.freeze(['default_template', 'form_template'] as const);

function requireComponents(type: string, input: InstanceInput): SduiComponent[] {
  if (!input.components?.length) throw new Error(`SDUI definition '${type}' requires at least one component`);
  return input.components;
}

function registerTemplate(type: string, defaults: Record<string, unknown> = {}): void {
  if (templateRegistry.has(type)) return;
  templateRegistry.register(type, (input: InstanceInput): SduiTemplate => ({
    id: input.id,
    type,
    properties: { ...defaults, ...input.properties },
    components: requireComponents(type, input),
  }));
}

export function registerProductionTemplateDefinitions(): void {
  registerTemplate('default_template');
  registerTemplate('form_template', { semanticRole: 'form' });
}
