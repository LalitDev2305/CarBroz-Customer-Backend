import type { SduiComponent } from '../../contract/component.schema.js';
import type { SduiTemplate } from '../../contract/template.schema.js';
import { templateRegistry, type InstanceInput } from '../../registry/registries.js';

/** Canonical product-neutral Template definition types available in production. */
export const PRODUCTION_TEMPLATE_TYPES = Object.freeze(['default_template', 'form_template'] as const);

/**
 * Enforces the Template -> Component invariant.
 *
 * @remarks
 * Templates are the root reusable layout definition and must always contain at
 * least one Component. Template definitions never skip directly to Section,
 * Group or Element.
 */
function requireComponents(type: string, input: InstanceInput): SduiComponent[] {
  if (!input.components?.length) throw new Error(`SDUI definition '${type}' requires at least one component`);
  return input.components;
}

/**
 * Registers one reusable Template definition in the UI SDK definition registry.
 *
 * @param type - Stable canonical Template type.
 * @param defaults - Product-neutral semantic defaults merged before runtime properties.
 *
 * @remarks
 * Registration is idempotent for production bootstrap. Runtime screen data is
 * supplied through `InstanceInput`; this helper must not contain Partner,
 * Customer or screen-name-specific behavior.
 */
function registerTemplate(type: string, defaults: Record<string, unknown> = {}): void {
  if (templateRegistry.has(type)) return;
  templateRegistry.register(type, (input: InstanceInput): SduiTemplate => ({
    id: input.id,
    type,
    properties: { ...defaults, ...input.properties },
    components: requireComponents(type, input),
  }));
}

/**
 * Registers the production Template vocabulary.
 *
 * @remarks
 * Called by the production SDUI definition bootstrap. New generic Template
 * definitions should be added here only when they represent reusable layout
 * semantics rather than a particular screen.
 */
export function registerProductionTemplateDefinitions(): void {
  registerTemplate('default_template');
  registerTemplate('form_template', { semanticRole: 'form' });
}
