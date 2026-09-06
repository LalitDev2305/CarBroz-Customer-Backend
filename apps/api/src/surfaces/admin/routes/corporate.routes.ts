import type { FastifyInstance } from 'fastify';
import { adminCorporateRoutes } from '../../../transport/corporate/routes/admin-corporate.routes.js';
/** Admin enterprise/corporate control-plane routes. */
export async function registerAdminCorporateRoutes(app: FastifyInstance): Promise<void> { await app.register(adminCorporateRoutes); }
