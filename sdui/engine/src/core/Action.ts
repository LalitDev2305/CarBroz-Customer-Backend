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

export function binding(key: string): SduiValueReference {
  return { $binding: key };
}

export function context(path: string): SduiValueReference {
  return { $context: path };
}

export function response(path: string): SduiValueReference {
  return { $response: path };
}

export function literal(value: unknown): SduiValueReference {
  return { $literal: value };
}

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
