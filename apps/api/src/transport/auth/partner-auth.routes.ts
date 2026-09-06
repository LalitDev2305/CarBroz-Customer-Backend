import type { FastifyInstance } from 'fastify';
import authRoutes from './auth.routes.js';

/** Mounts shared Identity authentication mechanics on the Partner surface. */
export async function registerPartnerAuthRoutes(app: FastifyInstance): Promise<void> { await app.register(authRoutes); }
