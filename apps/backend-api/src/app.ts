import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import fastifyRateLimit from '@fastify/rate-limit';
import { getFastifyLoggerConfig } from '@carbroz/logger';
import { AppConfig, SecurityConfig, LoggingConfig } from '@carbroz/config';
import { globalErrorHandler } from './middlewares/error-handler.js';
import diPlugin from './plugins/di.plugin.js';
import requestContextPlugin from './plugins/request-context.js';
import shutdownPlugin from './plugins/shutdown.plugin.js';
import jwtPlugin from './plugins/jwt.plugin.js';
import authorizationPlugin from './plugins/authorization.plugin.js';
import authRoutes from './modules/auth/api/auth.routes.js';
import healthRoutes from './modules/health/api/health.routes.js';
import { configRoutes } from './modules/config/api/config.routes.js';
import { ResponseHelper } from '@carbroz/common';
import uiRoutes from './ui/ui.routes.js';
import appRoutes from './app.routes.js';
import { partnerRoutes } from './modules/partner/api/partner.routes.js';
import { adminPartnerRoutes } from './modules/admin/api/admin-partner.routes.js';
import { mapsRoutes } from './modules/maps/api/maps.routes.js';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const buildApp = async (): Promise<FastifyInstance> => {
  const app = Fastify({
    logger: getFastifyLoggerConfig(LoggingConfig.logLevel),
  });

  await app.register(cors, {
    origin: SecurityConfig.corsOrigin,
    credentials: true,
  });

  // Security Headers
  await app.register(helmet);

  // Rate Limiting
  await app.register(fastifyRateLimit, {
    max: 100,
    timeWindow: '1 minute',
    errorResponseBuilder: (request, context) => {
      return ResponseHelper.error(
        `Rate limit exceeded, retry in ${context.after}`,
        'TOO_MANY_REQUESTS',
        request.traceId
      );
    }
  });

  // Graceful Shutdown
  await app.register(shutdownPlugin);

  // Plugins Registration Order
  
  // 0. DI Container (Must be registered early to bind request.diScope)
  await app.register(diPlugin);

  // 1. Request Context
  await app.register(requestContextPlugin);

  // 1.5 Static Files
  await app.register(fastifyStatic, {
    root: path.join(__dirname, '../public'),
    prefix: '/',
  });

  // 2. JWT Plugin
  await app.register(jwtPlugin);

  // 3. Authorization Plugin
  await app.register(authorizationPlugin);

  // Global Error Handler
  app.setErrorHandler(globalErrorHandler);

  // Not Found Handler
  app.setNotFoundHandler((request, reply) => {
    reply.status(404).send(
      ResponseHelper.error(
        `Route ${request.method}:${request.url} not found`,
        'NOT_FOUND',
        request.traceId
      )
    );
  });

  // Global JWT Decode Hook (Soft Check)
  app.addHook('onRequest', async (request, reply) => {
    if (request.headers.authorization) {
      try {
        await request.jwtVerify();
      } catch (err) {
        // Soft fail: Invalid tokens will just not set request.user
      }
    }
  });

  // Global Request Logger Hook
  app.addHook('preHandler', async (request, reply) => {
    request.log.info({ req: { method: request.method, url: request.url } }, `🚀 API CALL: ${request.method} ${request.url}`);
    if (request.body) {
      request.log.debug({ body: request.body }, '📦 Payload');
    }
  });

  app.addHook('onSend', async (request, reply, payload) => {
    try {
      const jsonPayload = JSON.parse(payload as string);
      request.log.info({ res: jsonPayload }, `✅ Response [${reply.statusCode}]`);
    } catch {
      request.log.info({ res: payload }, `✅ Response [${reply.statusCode}]`);
    }
    return payload;
  });

  // Routes
  await app.register(healthRoutes, { prefix: '/health' });
  await app.register(authRoutes, { prefix: '/v1/auth' });
  app.register(configRoutes, { prefix: '/v1/config' });
  app.register(uiRoutes, { prefix: '/v1/ui' });
  await app.register(appRoutes, { prefix: '/api/v1/app' });
  await app.register(partnerRoutes, { prefix: '/api/v1/partners' });
  await app.register(adminPartnerRoutes, { prefix: '/api/v1/admin/partners' });
  await app.register(mapsRoutes, { prefix: '/api/v1/maps' });

  return app;
};
