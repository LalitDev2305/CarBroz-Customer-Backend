import type {
  SduiAction,
  SduiAuthentication,
  SduiRequestMethod,
  SduiValueReference,
} from './SduiModel.js';

export type RequestBodyValue =
  | SduiValueReference
  | string
  | number
  | boolean
  | null
  | RequestBodyValue[]
  | { readonly [key: string]: RequestBodyValue };

export interface RequestActionOptions {
  readonly method: SduiRequestMethod;
  readonly endpoint: string;
  readonly authentication: SduiAuthentication;
  readonly validate?: boolean;
  readonly body?: Readonly<Record<string, RequestBodyValue>>;
  readonly responseMode?: 'none' | 'destination';
}

export interface DynamicDestination {
  readonly screenId: string;
  readonly templateId: string;
  readonly templateType: string;
  readonly endpoint: string;
  readonly method: 'GET';
  readonly authentication: SduiAuthentication;
}

export type PresentationMode = 'dialog' | 'bottom_sheet' | 'popup';
export type RuntimeStateOperation = 'set' | 'toggle';
export type RuntimeStateProperty = 'visible' | 'enabled' | 'selected' | 'expanded' | 'checked' | 'loading' | 'value';

export interface StateActionOptions {
  readonly targetId: string;
  readonly operation: RuntimeStateOperation;
  readonly property: RuntimeStateProperty;
  readonly value?: unknown;
}

export function binding(key: string): SduiValueReference { return { $binding: key }; }
export function context(path: string): SduiValueReference { return { $context: path }; }
export function response(path: string): SduiValueReference { return { $response: path }; }
export function literal(value: unknown): SduiValueReference { return { $literal: value }; }

export function requestAction(options: RequestActionOptions): SduiAction {
  return {
    type: 'request',
    payload: {
      method: options.method,
      endpoint: options.endpoint,
      authentication: options.authentication,
      validate: options.validate ?? false,
      ...(options.body ? { body: options.body as Record<string, RequestBodyValue> } : {}),
      responseMode: options.responseMode ?? 'none',
    },
  };
}

export function navigateAction(destination: DynamicDestination): SduiAction {
  return { type: 'navigate', payload: destination };
}

export function presentAction(targetId: string, presentation: PresentationMode): SduiAction {
  return { type: 'present', targetId, payload: { presentation } };
}

export function dismissAction(targetId?: string): SduiAction {
  return { type: 'dismiss', ...(targetId ? { targetId } : {}) };
}

export function stateAction(options: StateActionOptions): SduiAction {
  if (options.operation === 'set' && options.value === undefined) {
    throw new Error('SDUI state set action requires a value');
  }
  if (options.operation === 'toggle' && options.value !== undefined) {
    throw new Error('SDUI state toggle action must not provide a value');
  }
  if (options.operation === 'toggle' && !['visible', 'enabled', 'selected', 'expanded', 'checked', 'loading'].includes(options.property)) {
    throw new Error(`SDUI state toggle action cannot target '${options.property}'`);
  }
  return {
    type: 'state',
    targetId: options.targetId,
    payload: {
      operation: options.operation,
      property: options.property,
      ...(options.value !== undefined ? { value: options.value } : {}),
    },
  };
}

export function externalUriAction(uri: SduiValueReference): SduiAction {
  return { type: 'external_uri', payload: { uri } };
}

export function sequenceAction(actions: readonly SduiAction[]): SduiAction {
  if (actions.length === 0) throw new Error('SDUI sequence action requires at least one action');
  return { type: 'sequence', payload: { actions: [...actions] } };
}

/** Canonical authoring namespaces. They serialize to the frozen wire contract. */
export const ref = Object.freeze({ binding, context, response, literal });

export const action = Object.freeze({
  request: requestAction,
  navigate: navigateAction,
  present: presentAction,
  dismiss: dismissAction,
  state: stateAction,
  externalUri: externalUriAction,
  sequence: sequenceAction,
});
