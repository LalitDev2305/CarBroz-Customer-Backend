import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import { logFlow } from '@carbroz/platform-observability';

const startedAt = Symbol('carbroz.request.startedAt');
declare module 'fastify' { interface FastifyRequest { [startedAt]?: bigint; } }

function surfaceFor(url: string): 'partner' | 'customer' | 'admin' | 'system' {
  if (url.startsWith('/api/v1/partner/')) return 'partner';
  if (url.startsWith('/api/v1/customer/')) return 'customer';
  if (url.startsWith('/api/v1/admin/')) return 'admin';
  return 'system';
}
function safeRoute(request: { routeOptions?: { url?: string }; url: string }): string {
  return request.routeOptions?.url ?? request.url.split('?')[0] ?? '/';
}
/** Registers correlation-aware, payload-safe lifecycle logging for every HTTP request. */
export default fp(async function requestFlowPlugin(app: FastifyInstance) {
  app.addHook('onRequest', async (request) => {
    request[startedAt] = process.hrtime.bigint();
    logFlow(request.log, 'http.request.started', { correlationId: request.traceId ?? request.id, method: request.method, route: safeRoute(request), surface: surfaceFor(request.url), outcome: 'started' });
  });
  app.addHook('onError', async (request, _reply, error) => {
    logFlow(request.log, 'http.request.failed', { correlationId: request.traceId ?? request.id, method: request.method, route: safeRoute(request), surface: surfaceFor(request.url), outcome: 'failed', errorCode: typeof (error as { code?: unknown }).code === 'string' ? (error as { code: string }).code : 'UNEXPECTED_ERROR' });
  });
  app.addHook('onResponse', async (request, reply) => {
    const start = request[startedAt];
    logFlow(request.log, 'http.request.completed', { correlationId: request.traceId ?? request.id, method: request.method, route: safeRoute(request), surface: surfaceFor(request.url), statusCode: reply.statusCode, durationMs: start ? Number(process.hrtime.bigint() - start) / 1_000_000 : undefined, outcome: reply.statusCode >= 500 ? 'failed' : 'completed' });
  });
});
