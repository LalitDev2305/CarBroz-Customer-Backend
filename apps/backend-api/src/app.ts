import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { getFastifyLoggerConfig } from '@carbroz/logger';
import { AppConfig, SecurityConfig } from '@carbroz/config';
import { globalErrorHandler } from './middlewares/error-handler.js';
import requestContextPlugin from './plugins/request-context.js';
import jwtPlugin from './plugins/jwt.plugin.js';
import authRoutes from './modules/auth/api/auth.routes.js';
import { ResponseHelper } from '@carbroz/common';
import uiRoutes from './ui/ui.routes.js';
import appRoutes from './app.routes.js';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const buildApp = async (): Promise<FastifyInstance> => {
  const app = Fastify({
    logger: getFastifyLoggerConfig(AppConfig.logLevel),
  });

  // Plugins Registration Order
  // 1. Request Context
  await app.register(requestContextPlugin);

  // 1.5 Static Files
  await app.register(fastifyStatic, {
    root: path.join(__dirname, '../public'),
    prefix: '/',
  });

  // 2. JWT Plugin
  await app.register(jwtPlugin);

  // 3. Helmet
  await app.register(helmet);

  // 3. CORS
  await app.register(cors, {
    origin: SecurityConfig.corsOrigin,
  });

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
    console.log(`\n==================================================`);
    console.log(`🚀 API CALL: ${request.method} ${request.url}`);
    console.log(`==================================================`);
    if (request.body) {
      console.log(`📦 Payload:\n${JSON.stringify(request.body, null, 2)}`);
    }
  });

  app.addHook('onSend', async (request, reply, payload) => {
    console.log(`--------------------------------------------------`);
    console.log(`✅ Response [${reply.statusCode}]:`);
    try {
      const jsonPayload = JSON.parse(payload as string);
      console.log(JSON.stringify(jsonPayload, null, 2));
    } catch {
      console.log(payload);
    }
    console.log(`==================================================\n`);
    return payload;
  });

  // Routes
  await app.register(authRoutes, { prefix: '/api/v1/auth' });
  await app.register(uiRoutes, { prefix: '/api/v1/screen' });
  await app.register(appRoutes, { prefix: '/api/v1/app' });

  return app;
};
