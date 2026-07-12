import Fastify from 'fastify';
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
export const buildApp = async () => {
    const app = Fastify({
        logger: getFastifyLoggerConfig(AppConfig.logLevel),
    });
    // Plugins Registration Order
    // 1. Request Context
    await app.register(requestContextPlugin);
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
        reply.status(404).send(ResponseHelper.error(`Route ${request.method}:${request.url} not found`, 'NOT_FOUND', request.traceId));
    });
    // Global JWT Decode Hook (Soft Check)
    app.addHook('onRequest', async (request, reply) => {
        if (request.headers.authorization) {
            try {
                await request.jwtVerify();
            }
            catch (err) {
                // Soft fail: Invalid tokens will just not set request.user
            }
        }
    });
    // Global Request Logger Hook
    app.addHook('onRequest', async (request, reply) => {
        console.log(`\n🚀 [BACKEND LOG] Incoming Request: ${request.method} ${request.url}`);
        console.log(`📡 [BACKEND LOG] Headers:`, JSON.stringify(request.headers));
    });
    app.addHook('onResponse', async (request, reply) => {
        console.log(`✅ [BACKEND LOG] Response Sent: ${reply.statusCode} for ${request.method} ${request.url}\n`);
    });
    // Routes
    await app.register(authRoutes, { prefix: '/api/v1/auth' });
    await app.register(uiRoutes, { prefix: '/api/v1/screen' });
    await app.register(appRoutes, { prefix: '/api/v1/app' });
    return app;
};
//# sourceMappingURL=app.js.map