import { ResponseHelper } from '../transport/response/ResponseHelper.js';
import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import fastifyRateLimit from '@fastify/rate-limit';
import { getFastifyLoggerConfig } from '@carbroz/platform-observability';
import { SecurityConfig, LoggingConfig } from './config/index.js';
import { globalErrorHandler } from '../transport/middleware/error-handler.js';
import diPlugin from './plugins/di.plugin.js';
import requestContextPlugin from './plugins/request-context.js';
import shutdownPlugin from './plugins/shutdown.plugin.js';
import jwtPlugin from './plugins/jwt.plugin.js';
import authorizationPlugin from './plugins/authorization.plugin.js';
import healthRoutes from '../system/health/health.routes.js';
import { partnerRoutes } from '../surfaces/partner/partner.routes.js';
import partnerAuthRoutes from '../surfaces/partner/auth/partner-auth.routes.js';
import { adminPartnerRoutes } from '../surfaces/admin/admin-partner.routes.js';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { fileURLToPath } from 'url';
import fastifyMultipart from '@fastify/multipart';
import { kycRoutes } from '../surfaces/partner/kyc.routes.js';
import { adminKycRoutes } from '../surfaces/admin/admin-kyc.routes.js';
import customerRoutes from '../surfaces/customer/customer.routes.js';
import catalogRoutes from '../surfaces/customer/catalog/catalog.routes.js';
import adminCatalogRoutes from '../surfaces/admin/admin-catalog.routes.js';
import adminSduiRoutes from '../surfaces/admin/admin-sdui.routes.js';
import { reviewRoutes } from '../surfaces/customer/review/review.controller.js';
import { adminReviewRoutes } from '../surfaces/admin/reviews/admin-review.routes.js';
import { couponRoutes } from '../surfaces/customer/coupon/coupon.controller.js';
import { adminCouponRoutes } from '../surfaces/admin/coupons/admin-coupon.routes.js';
import { disputeRoutes } from '../surfaces/customer/dispute/dispute.controller.js';
import { adminDisputeRoutes } from '../surfaces/admin/disputes/admin-dispute.routes.js';
import { corporateRoutes } from '../surfaces/customer/corporate/routes/corporate.routes.js';
import { adminCorporateRoutes } from '../surfaces/admin/corporate/admin-corporate.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

  await app.register(partnerAuthRoutes, { prefix: '/api/v1/partner/auth' });
  await app.register(partnerRoutes, { prefix: '/api/v1/partner' });
  await app.register(kycRoutes, { prefix: '/api/v1/partner' });

  await app.register(customerRoutes, { prefix: '/api/v1/customer' });
  await app.register(catalogRoutes, { prefix: '/api/v1/customer/catalog' });
  await app.register(reviewRoutes, { prefix: '/api/v1/customer' });
  await app.register(couponRoutes, { prefix: '/api/v1/customer' });
  await app.register(disputeRoutes, { prefix: '/api/v1/customer' });
  await app.register(corporateRoutes, { prefix: '/api/v1/customer/corporate' });

  await app.register(adminPartnerRoutes, { prefix: '/api/v1/admin/partners' });
  await app.register(adminKycRoutes, { prefix: '/api/v1/admin/kyc' });
  await app.register(adminCatalogRoutes, { prefix: '/api/v1/admin/catalog' });
  await app.register(adminSduiRoutes, { prefix: '/api/v1/admin/sdui' });
  await app.register(adminReviewRoutes, { prefix: '/api/v1/admin/reviews' });
  await app.register(adminCouponRoutes, { prefix: '/api/v1/admin/coupons' });
  await app.register(adminDisputeRoutes, { prefix: '/api/v1/admin/disputes' });
  await app.register(adminCorporateRoutes, { prefix: '/api/v1/admin/corporate' });

  return app;
};
