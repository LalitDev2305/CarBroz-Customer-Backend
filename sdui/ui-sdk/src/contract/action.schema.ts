import { z } from 'zod';
import { idSchema } from './common.schema.js';

export const authenticationSchema = z.enum(['NONE', 'SESSION']);
export const requestMethodSchema = z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);

export type SduiAuthentication = z.infer<typeof authenticationSchema>;
export type SduiRequestMethod = z.infer<typeof requestMethodSchema>;
export type SduiRequestResponseMode = 'none' | 'destination';

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
  payload: z.object({
    presentation: z.enum(['dialog', 'bottom_sheet', 'popup']),
  }).strict(),
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

export const actionsSchema = z.record(z.string().trim().min(1), actionSchema);
