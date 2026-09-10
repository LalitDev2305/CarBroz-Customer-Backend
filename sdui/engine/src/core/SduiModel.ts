import { z } from 'zod';

/** Current canonical SDUI wire schema emitted by new production screen composers. */
export const CURRENT_SDUI_SCHEMA_VERSION = '3.0.0' as const;

/** `3.0` remains readable only for already-persisted backward-compatible documents. */
export const SUPPORTED_SDUI_SCHEMA_VERSIONS = Object.freeze(['3.0.0', '3.0'] as const);

export function isSupportedSduiSchemaVersion(version: string): boolean {
  return (SUPPORTED_SDUI_SCHEMA_VERSIONS as readonly string[]).includes(version);
}

const idSchema = z.string().trim().min(1);
const typeSchema = z.string().trim().min(1);
const propertiesSchema = z.record(z.string(), z.unknown());
export const targetAppSchema = z.enum(['GLOBAL', 'PARTNER', 'CUSTOMER']);

export const authenticationSchema = z.enum(['NONE', 'SESSION']);
export const requestMethodSchema = z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);

export type SduiAuthentication = z.infer<typeof authenticationSchema>;
export type SduiRequestMethod = z.infer<typeof requestMethodSchema>;
export type SduiRequestResponseMode = 'none' | 'destination';
export type SduiTargetApp = z.infer<typeof targetAppSchema>;

export const dynamicDestinationSchema = z.object({
  screenId: idSchema,
  templateId: idSchema,
  templateType: idSchema,
  endpoint: z.string().trim().startsWith('/'),
  method: z.literal('GET'),
  authentication: authenticationSchema,
}).strict();

const bindingReferenceSchema = z.object({ $binding: idSchema }).strict();
const literalReferenceSchema = z.object({ $literal: z.unknown() }).strict();
const responseReferenceSchema = z.object({ $response: z.string().trim().min(1) }).strict();
const contextReferenceSchema = z.object({ $context: z.string().trim().min(1) }).strict();

export const valueReferenceSchema = z.union([
  bindingReferenceSchema,
  literalReferenceSchema,
  responseReferenceSchema,
  contextReferenceSchema,
]);

export type SduiValueReference = z.infer<typeof valueReferenceSchema>;

const requestBodyValueSchema: z.ZodType<unknown> = z.lazy(() => z.union([
  valueReferenceSchema,
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
  z.array(requestBodyValueSchema),
  z.record(z.string(), requestBodyValueSchema),
]));

const requestActionSchema = z.object({
  type: z.literal('request'),
  payload: z.object({
    method: requestMethodSchema,
    endpoint: z.string().trim().startsWith('/'),
    authentication: authenticationSchema,
    validate: z.boolean().default(false),
    body: z.record(z.string(), requestBodyValueSchema).optional(),
    responseMode: z.enum(['none', 'destination']).default('none'),
  }).strict(),
}).strict();

const navigateActionSchema = z.object({
  type: z.literal('navigate'),
  payload: dynamicDestinationSchema,
}).strict();

const presentActionSchema = z.object({
  type: z.literal('present'),
  targetId: idSchema,
  payload: z.object({ presentation: z.enum(['dialog', 'bottom_sheet', 'popup']) }).strict(),
}).strict();

const dismissActionSchema = z.object({
  type: z.literal('dismiss'),
  targetId: idSchema.optional(),
}).strict();

const stateActionSchema = z.object({
  type: z.literal('state'),
  targetId: idSchema,
  payload: z.object({
    operation: z.enum(['set', 'toggle']),
    property: z.enum(['visible', 'enabled', 'selected', 'expanded', 'checked', 'loading', 'value']),
    value: z.unknown().optional(),
  }).strict().superRefine((payload, context) => {
    if (payload.operation === 'set' && payload.value === undefined) {
      context.addIssue({ code: 'custom', path: ['value'], message: 'state set operation requires value' });
    }
    if (payload.operation === 'toggle' && payload.value !== undefined) {
      context.addIssue({ code: 'custom', path: ['value'], message: 'state toggle operation must not provide value' });
    }
    if (payload.operation === 'toggle' && !['visible', 'enabled', 'selected', 'expanded', 'checked', 'loading'].includes(payload.property)) {
      context.addIssue({ code: 'custom', path: ['property'], message: 'state toggle operation requires a boolean runtime-state property' });
    }
  }),
}).strict();

const externalUriActionSchema = z.object({
  type: z.literal('external_uri'),
  payload: z.object({ uri: valueReferenceSchema }).strict(),
}).strict();

export type SduiAction =
  | z.infer<typeof requestActionSchema>
  | z.infer<typeof navigateActionSchema>
  | z.infer<typeof presentActionSchema>
  | z.infer<typeof dismissActionSchema>
  | z.infer<typeof stateActionSchema>
  | z.infer<typeof externalUriActionSchema>
  | { type: 'sequence'; payload: { actions: SduiAction[] } };

export const actionSchema: z.ZodType<SduiAction> = z.lazy(() => z.union([
  requestActionSchema,
  navigateActionSchema,
  presentActionSchema,
  dismissActionSchema,
  stateActionSchema,
  externalUriActionSchema,
  z.object({
    type: z.literal('sequence'),
    payload: z.object({ actions: z.array(actionSchema).min(1) }).strict(),
  }).strict(),
]));

const actionsSchema = z.record(z.string().trim().min(1), actionSchema);

export const elementBindingSchema = z.object({ key: idSchema }).strict();

export const elementSchema = z.object({
  id: idSchema,
  type: typeSchema,
  properties: propertiesSchema.default({}),
  actions: actionsSchema.optional(),
  analytics: z.record(z.string(), z.unknown()).optional(),
  accessibility: z.record(z.string(), z.unknown()).optional(),
  validation: z.record(z.string(), z.unknown()).optional(),
  binding: elementBindingSchema.optional(),
  visibility: z.record(z.string(), z.unknown()).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
}).strict();

export type SduiElement = z.infer<typeof elementSchema>;
export type SduiElementBinding = z.infer<typeof elementBindingSchema>;

export const groupSchema = z.object({
  id: idSchema,
  type: typeSchema,
  properties: propertiesSchema.optional(),
  elements: z.array(elementSchema).min(1),
}).strict();

export type SduiGroup = z.infer<typeof groupSchema>;

const sectionBase = {
  id: idSchema,
  type: typeSchema,
  properties: propertiesSchema.optional(),
};

export const directElementSectionSchema = z.object({
  ...sectionBase,
  elements: z.array(elementSchema).min(1),
}).strict();

export const groupedSectionSchema = z.object({
  ...sectionBase,
  groups: z.array(groupSchema).min(1),
}).strict();

export const sectionSchema = z.union([directElementSectionSchema, groupedSectionSchema]);
export type SduiSection = z.infer<typeof sectionSchema>;

const componentBase = {
  id: idSchema,
  type: typeSchema,
  properties: propertiesSchema.optional(),
};

export const directElementComponentSchema = z.object({
  ...componentBase,
  elements: z.array(elementSchema).min(1),
}).strict();

export const sectionComponentSchema = z.object({
  ...componentBase,
  sections: z.array(sectionSchema).min(1),
}).strict();

export const componentSchema = z.union([directElementComponentSchema, sectionComponentSchema]);
export type SduiComponent = z.infer<typeof componentSchema>;

export const templateSchema = z.object({
  id: idSchema,
  type: typeSchema,
  properties: propertiesSchema.optional(),
  components: z.array(componentSchema).min(1),
}).strict();

export type SduiTemplate = z.infer<typeof templateSchema>;

export const themeSchema = z.object({
  theme: z.enum(['light', 'dark']).optional(),
  showBackButton: z.boolean().optional(),
  statusBar: z.enum(['transparent', 'default']).optional(),
  properties: propertiesSchema.optional(),
}).strict();

export type SduiTheme = z.infer<typeof themeSchema>;

function collectNodeIds(template: SduiTemplate): string[] {
  const ids: string[] = [template.id];
  for (const component of template.components) {
    ids.push(component.id);
    if ('elements' in component) {
      for (const element of component.elements) ids.push(element.id);
      continue;
    }
    for (const section of component.sections) {
      ids.push(section.id);
      if ('elements' in section) {
        for (const element of section.elements) ids.push(element.id);
        continue;
      }
      for (const group of section.groups) {
        ids.push(group.id);
        for (const element of group.elements) ids.push(element.id);
      }
    }
  }
  return ids;
}

export const screenSchema = z.object({
  screenId: idSchema,
  schemaVersion: z.string().trim().min(1),
  targetApp: targetAppSchema,
  template: templateSchema,
  theme: themeSchema.optional(),
  metadata: propertiesSchema.optional(),
}).strict().superRefine((screen, context) => {
  const seen = new Set<string>();
  for (const id of collectNodeIds(screen.template)) {
    if (seen.has(id)) {
      context.addIssue({
        code: 'custom',
        path: ['template'],
        message: `Duplicate structural id '${id}'`,
      });
      break;
    }
    seen.add(id);
  }
});

export type SduiScreen = z.infer<typeof screenSchema>;
