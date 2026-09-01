import { FastifyReply, FastifyRequest } from 'fastify';
import { ResponseHelper } from '@carbroz/common';
import { GetAppBootstrapUseCase } from '../use-cases/GetAppBootstrapUseCase.js';
import { AppBootstrapHeadersSchema } from '../dtos/app-bootstrap.dto.js';

export class AppBootstrapController {
  constructor(private readonly getAppBootstrapUseCase: GetAppBootstrapUseCase) {}

  public getBootstrap = async (request: FastifyRequest, reply: FastifyReply) => {
    const client = AppBootstrapHeadersSchema.parse({
      appVersion: headerValue(request, 'x-carbroz-app-version'),
      buildNumber: headerValue(request, 'x-carbroz-build-number'),
      applicationId: headerValue(request, 'x-carbroz-application-id'),
      bootstrapSchemaVersion: headerValue(request, 'x-carbroz-bootstrap-schema'),
      sduiProtocolVersion: headerValue(request, 'x-carbroz-sdui-protocol'),
      sduiSchemaVersion: headerValue(request, 'x-carbroz-sdui-schema'),
      configVersion: optionalHeaderValue(request, 'x-carbroz-config-version'),
    });

    const jwt = request.user as Record<string, unknown> | undefined;
    const userId = numericClaim(jwt?.id ?? jwt?.sub);
    const sessionId = numericClaim(jwt?.sessionId);
    const tokenExpSeconds = numericClaim(jwt?.exp);

    const result = await this.getAppBootstrapUseCase.execute({
      client,
      auth: {
        userId,
        sessionId,
        tokenExpiresAtEpochMilliseconds: tokenExpSeconds === undefined
          ? undefined
          : tokenExpSeconds * 1_000,
      },
      requestId: request.traceId,
    });

    return reply.status(200).send(
      ResponseHelper.success(result, 'Bootstrap configuration resolved', request.traceId),
    );
  };
}

function headerValue(request: FastifyRequest, name: string): string | undefined {
  const value = request.headers[name];
  return Array.isArray(value) ? value[0] : value;
}

function optionalHeaderValue(request: FastifyRequest, name: string): string | undefined {
  const value = headerValue(request, name)?.trim();
  return value ? value : undefined;
}

function numericClaim(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isInteger(value) && value >= 0) return value;
  if (typeof value === 'string' && /^\d+$/.test(value)) return Number(value);
  return undefined;
}
