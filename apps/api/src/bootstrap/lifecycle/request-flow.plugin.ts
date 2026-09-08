import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import {
  emitFlowDiagnostic,
  emitHttpErrorDiagnostic,
  emitHttpRequestDiagnostic,
  emitHttpResponseDiagnostic,
  logFlow,
} from '@carbroz/platform-observability';

const startedAt = Symbol('carbroz.request.startedAt');
const errorCode = Symbol('carbroz.request.errorCode');
declare module 'fastify' {
  interface FastifyRequest {
    [startedAt]?: bigint;
    [errorCode]?: string;
  }
}

function surfaceFor(url: string): 'partner' | 'customer' | 'admin' | 'system' {
  if (url.startsWith('/api/v1/partner/')) return 'partner';
  if (url.startsWith('/api/v1/customer/')) return 'customer';
  if (url.startsWith('/api/v1/admin/')) return 'admin';
  return 'system';
}

function safeRoute(request: { routeOptions?: { url?: string }; url: string }): string {
  return request.routeOptions?.url ?? request.url.split('?')[0] ?? '/';
}

function diagnosticConsoleEnabled(): boolean {
  const environment = (process.env.CARBROZ_ENVIRONMENT ?? process.env.NODE_ENV ?? 'development')
    .trim()
    .toLowerCase();
  return environment === 'development' || environment === 'staging';
}

function isApplicationApi(url: string): boolean {
  return url.startsWith('/api/');
}

function diagnosticHeaders(headers: Record<string, unknown>): Record<string, unknown> {
  const allowed = new Set([
    'authorization',
    'content-type',
    'accept',
    'idempotency-key',
    'x-carbroz-platform',
    'x-carbroz-app-version',
    'x-carbroz-build-number',
    'x-correlation-id',
    'x-request-id',
  ]);
  return Object.fromEntries(
    Object.entries(headers).filter(([name]) => allowed.has(name.toLowerCase())),
  );
}

function durationSince(start: bigint | undefined): number | undefined {
  return start ? Number(process.hrtime.bigint() - start) / 1_000_000 : undefined;
}

function payloadForDiagnostics(payload: unknown): unknown {
  if (Buffer.isBuffer(payload)) return payload.toString('utf8');
  return payload;
}

/**
 * Single correlation-aware HTTP lifecycle owner.
 *
 * Development/Staging: emits only curated FLOW + API request/response/error console blocks.
 * Production: emits privacy-safe structured lifecycle events through Pino and never logs payload bodies.
 */
export default fp(async function requestFlowPlugin(app: FastifyInstance) {
  const detailed = diagnosticConsoleEnabled();

  app.addHook('onRequest', async (request) => {
    request[startedAt] = process.hrtime.bigint();
    if (detailed) return;
    logFlow(request.log, 'http.request.started', {
      correlationId: request.traceId ?? request.id,
      method: request.method,
      route: safeRoute(request),
      surface: surfaceFor(request.url),
      outcome: 'started',
    });
  });

  app.addHook('preHandler', async (request) => {
    if (!detailed || !isApplicationApi(request.url)) return;
    const correlationId = request.traceId ?? request.id;
    emitFlowDiagnostic(
      true,
      correlationId,
      `Fastify.${request.method}(${safeRoute(request)})`,
      `${surfaceFor(request.url)} route handler`,
    );
    emitHttpRequestDiagnostic(true, {
      correlationId,
      method: request.method,
      url: request.url,
      headers: diagnosticHeaders(request.headers as Record<string, unknown>),
      body: request.body,
    });
  });

  app.addHook('onError', async (request, _reply, error) => {
    request[errorCode] = typeof (error as { code?: unknown }).code === 'string'
      ? (error as { code: string }).code
      : 'UNEXPECTED_ERROR';

    if (detailed) return;
    logFlow(request.log, 'http.request.failed', {
      correlationId: request.traceId ?? request.id,
      method: request.method,
      route: safeRoute(request),
      surface: surfaceFor(request.url),
      outcome: 'failed',
      errorCode: request[errorCode],
    });
  });

  app.addHook('onSend', async (request, reply, payload) => {
    if (!detailed || !isApplicationApi(request.url)) return payload;
    const correlationId = request.traceId ?? request.id;
    const durationMs = durationSince(request[startedAt]);
    const body = payloadForDiagnostics(payload);

    if (reply.statusCode >= 400) {
      emitHttpErrorDiagnostic(true, {
        correlationId,
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        errorCode: request[errorCode] ?? `HTTP_${reply.statusCode}`,
        durationMs,
        body,
      });
    } else {
      emitHttpResponseDiagnostic(true, {
        correlationId,
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        durationMs,
        body,
      });
    }
    return payload;
  });

  app.addHook('onResponse', async (request, reply) => {
    if (detailed) return;
    logFlow(request.log, 'http.request.completed', {
      correlationId: request.traceId ?? request.id,
      method: request.method,
      route: safeRoute(request),
      surface: surfaceFor(request.url),
      statusCode: reply.statusCode,
      durationMs: durationSince(request[startedAt]),
      outcome: reply.statusCode >= 500 ? 'failed' : 'completed',
    });
  });
});
