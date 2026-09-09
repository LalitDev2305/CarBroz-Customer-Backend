import type {
  SduiAction,
  SduiAuthentication,
  SduiRequestMethod,
  SduiRequestResponseMode,
} from '../contract/action.schema.js';

export interface ActionBuildable {
  build(): SduiAction;
}

/**
 * Typed authoring helper for request bodies.
 * Screen code uses semantic value sources; serialization to $binding/$context/$response/$literal
 * stays inside the SDK.
 */
export class RequestBodyBuilder {
  private readonly values: Record<string, unknown> = {};

  binding(field: string, bindingKey: string): this {
    this.values[field] = { $binding: bindingKey };
    return this;
  }

  context(field: string, contextPath: string): this {
    this.values[field] = { $context: contextPath };
    return this;
  }

  response(field: string, responsePath: string): this {
    this.values[field] = { $response: responsePath };
    return this;
  }

  literal(field: string, value: unknown): this {
    this.values[field] = { $literal: value };
    return this;
  }

  build(): Record<string, unknown> {
    return { ...this.values };
  }

  isEmpty(): boolean {
    return Object.keys(this.values).length === 0;
  }
}

/**
 * Typed Builder for the existing canonical request action contract.
 * It does not introduce a second action model; build() emits the same SduiAction shape.
 */
export class RequestActionBuilder implements ActionBuildable {
  private requestMethod?: SduiRequestMethod;
  private requestEndpoint?: string;
  private requestAuthentication?: SduiAuthentication;
  private shouldValidate = false;
  private requestResponseMode: SduiRequestResponseMode = 'none';
  private readonly requestBody = new RequestBodyBuilder();

  method(value: SduiRequestMethod): this {
    this.requestMethod = value;
    return this;
  }

  endpoint(value: string): this {
    this.requestEndpoint = value;
    return this;
  }

  authentication(value: SduiAuthentication): this {
    this.requestAuthentication = value;
    return this;
  }

  validate(value = true): this {
    this.shouldValidate = value;
    return this;
  }

  responseMode(value: SduiRequestResponseMode): this {
    this.requestResponseMode = value;
    return this;
  }

  body(): RequestBodyBuilder {
    return this.requestBody;
  }

  build(): SduiAction {
    if (!this.requestMethod) throw new Error('Request action requires method');
    if (!this.requestEndpoint) throw new Error('Request action requires endpoint');
    if (!this.requestAuthentication) throw new Error('Request action requires authentication');

    return {
      type: 'request',
      payload: {
        method: this.requestMethod,
        endpoint: this.requestEndpoint,
        authentication: this.requestAuthentication,
        validate: this.shouldValidate,
        ...(!this.requestBody.isEmpty() ? { body: this.requestBody.build() } : {}),
        responseMode: this.requestResponseMode,
      },
    };
  }
}
