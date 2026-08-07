import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import { getContainer } from './container/index.js';
import { appRoutes } from './app.routes.js';
export async function buildApp() {
    const app = Fastify({
        logger: true
    });
    await app.register(cors, { origin: '*' });
    await app.register(helmet, { contentSecurityPolicy: false });
    await app.register(jwt, { secret: process.env.JWT_SECRET || 'carbroz_jwt_secret_dev' });
    getContainer();
    await app.register(appRoutes);
    return app;
}
//# sourceMappingURL=app.js.map