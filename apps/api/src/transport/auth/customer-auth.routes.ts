import type { FastifyInstance } from 'fastify';
import authRoutes from './auth.routes.js';

/** Mounts shared Identity authentication mechanics on the Customer surface. */
export async function registerCustomerAuthRoutes(app: FastifyInstance): Promise<void> { await app.register(authRoutes); }
