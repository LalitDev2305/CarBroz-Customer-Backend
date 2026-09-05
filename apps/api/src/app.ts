import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import fastifyRateLimit from '@fastify/rate-limit';
import { getFastifyLoggerConfig } from '@carbroz/platform-observability';
import { SecurityConfig, LoggingConfig } from './config/runtime-config.js';
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
import appRoutes from './app.routes.js';
import { partnerRoutes } from './modules/partner/api/partner.routes.js';
import { adminPartnerRoutes } from './modules/admin/api/admin-partner.routes.js';
import { mapsRoutes } from './modules/maps/api/maps.routes.js';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import fastifyMultipart from '@fastify/multipart';
import { kycRoutes } from './modules/partner/api/kyc.routes.js';
import { adminKycRoutes } from './modules/admin/api/admin-kyc.routes.js';
import customerRoutes from './modules/customer/api/customer.routes.js';
import catalogRoutes from './modules/catalog/api/catalog.routes.js';
import adminCatalogRoutes from './modules/admin/api/admin-catalog.routes.js';
import sduiRegistryRoutes from './modules/sdui/api/sdui-registry.routes.js';
import adminSduiRoutes from './modules/admin/api/admin-sdui.routes.js';
import { reviewRoutes } from './modules/review/api/review.controller.js';
import { couponRoutes } from './modules/coupon/api/coupon.controller.js';
import { disputeRoutes } from './modules/dispute/api/dispute.controller.js';
import { corporateRoutes } from './modules/corporate/routes/corporate.routes.js';
import { adminCorporateRoutes } from './modules/corporate/routes/admin-corporate.routes.js';

export const buildApp = async (): Promise<FastifyInstance> => {
  const app = Fastify({ logger: getFastifyLoggerConfig(LoggingConfig.logLevel) });

  await app.register(fastifyMultipart, { limits: { fileSize: 5 * 1024 * 1024 } });
  await app.register(cors, { origin: SecurityConfig.corsOrigin, credentials: true });
  await app.register(helmet);
  await app.register(fastifyRateLimit, {
    max: 100,
    timeWindow: '1 minute',
    errorResponseBuilder: (request, context) => ResponseHelper.error(
      `Rate limit exceeded, retry in ${context.after}`,
      'TOO_MANY_REQUESTS',
      request.traceId,
    ),
  });

  await app.register(shutdownPlugin);
  await app.register(diPlugin);
  await app.register(requestContextPlugin);
  await app.register(fastifyStatic, { root: path.join(__dirname, '../public'), prefix: '/' });
  await app.register(jwtPlugin);
  await app.register(authorizationPlugin);

  app.setErrorHandler(globalErrorHandler);
  app.setNotFoundHandler((request, reply) => {
    reply.status(404).send(ResponseHelper.error(
      `Route ${request.method}:${request.url} not found`,
      'NOT_FOUND',
      request.traceId,
    ));
  });

  app.addHook('onRequest', async (request) => {
    if (request.headers.authorization) {
      try {
        await request.jwtVerify();
      } catch {
        // Soft authentication check. Protected routes enforce authorization separately.
      }
    }
  });

  app.addHook('preHandler', async (request) => {
    request.log.info({ req: { method: request.method, url: request.url } }, `🚀 API CALL: ${request.method} ${request.url}`);
    if (request.body) request.log.debug({ body: request.body }, '📦 Payload');
  });

  app.addHook('onSend', async (request, reply, payload) => {
    try {
      request.log.info({ res: JSON.parse(payload as string) }, `✅ Response [${reply.statusCode}]`);
    } catch {
      request.log.info({ res: payload }, `✅ Response [${reply.statusCode}]`);
    }
    return payload;
  });

  await app.register(healthRoutes, { prefix: '/health' });
  await app.register(authRoutes, { prefix: '/api/v1/auth' });
  await app.register(configRoutes, { prefix: '/api/v1/config' });
  await app.register(appRoutes, { prefix: '/api/v1/app' });
  await app.register(partnerRoutes, { prefix: '/api/v1/partners' });
  await app.register(adminPartnerRoutes, { prefix: '/api/v1/admin/partners' });
  await app.register(mapsRoutes, { prefix: '/api/v1/maps' });
  await app.register(kycRoutes, { prefix: '/api/v1/partners' });
  await app.register(adminKycRoutes, { prefix: '/api/v1/admin/kyc' });
  await app.register(customerRoutes, { prefix: '/api/v1/customers' });
  await app.register(catalogRoutes, { prefix: '/api/v1/catalog' });
  await app.register(adminCatalogRoutes, { prefix: '/api/v1/admin/catalog' });
  await app.register(sduiRegistryRoutes, { prefix: '/api/v1/sdui' });
  await app.register(adminSduiRoutes, { prefix: '/api/v1/admin/sdui' });
  await app.register(reviewRoutes);
  await app.register(couponRoutes);
  await app.register(disputeRoutes);
  await app.register(corporateRoutes, { prefix: '/api/v1/corporate' });
  await app.register(adminCorporateRoutes, { prefix: '/api/v1/admin/corporate' });

  return app;
};
