import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifyMultipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getFastifyLoggerConfig } from '@carbroz/platform-observability';
import { SecurityConfig, LoggingConfig } from './config/runtime-config.js';
import { globalErrorHandler } from '../transport/middleware/error-handler.js';
import { ResponseHelper } from '../transport/response/ResponseHelper.js';
import diPlugin from './plugins/di.plugin.js';
import requestContextPlugin from './plugins/request-context.js';
import shutdownPlugin from './plugins/shutdown.plugin.js';
import jwtPlugin from './plugins/jwt.plugin.js';
import authorizationPlugin from './plugins/authorization.plugin.js';
import requestFlowPlugin from './lifecycle/request-flow.plugin.js';
import { registerCustomerSurface } from '../surfaces/customer/routes/index.js';
import { registerPartnerSurface } from '../surfaces/partner/routes/index.js';
import { registerAdminSurface } from '../surfaces/admin/routes/index.js';
import healthRoutes from '../system/health/health.routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Builds the Fastify composition root; no business rules live in this executable layer. */
export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: getFastifyLoggerConfig(LoggingConfig.logLevel),
    // request-flow.plugin is the single HTTP lifecycle owner; Fastify's automatic lines would duplicate it.
    disableRequestLogging: true,
  });
  await app.register(fastifyMultipart, { limits: { fileSize: 5 * 1024 * 1024 } });
  await app.register(cors, { origin: SecurityConfig.corsOrigin, credentials: true });
  await app.register(helmet);
  await app.register(fastifyRateLimit, {
    max: 100,
    timeWindow: '1 minute',
    errorResponseBuilder: (request, context) => ResponseHelper.error('Rate limit exceeded, retry in ' + context.after, 'TOO_MANY_REQUESTS', request.traceId),
  });
  await app.register(shutdownPlugin);
  await app.register(diPlugin);
  await app.register(requestContextPlugin);
  await app.register(jwtPlugin);
  await app.register(authorizationPlugin);
  await app.register(requestFlowPlugin);
  await app.register(fastifyStatic, { root: path.join(__dirname, '../../public'), prefix: '/' });

  app.setErrorHandler(globalErrorHandler);
  app.setNotFoundHandler((request, reply) => reply.status(404).send(ResponseHelper.error('Route not found', 'NOT_FOUND', request.traceId)));
  app.addHook('onRequest', async (request) => {
    if (!request.headers.authorization) return;
    try { await request.jwtVerify(); } catch { /* protected routes enforce authorization explicitly */ }
  });

  await app.register(healthRoutes, { prefix: '/health' });
  await app.register(registerPartnerSurface, { prefix: '/api/v1/partner' });
  await app.register(registerCustomerSurface, { prefix: '/api/v1/customer' });
  await app.register(registerAdminSurface, { prefix: '/api/v1/admin' });
  return app;
}
