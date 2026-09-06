import type { FastifyInstance } from 'fastify';
import { corporateRoutes } from '../../../transport/corporate/routes/corporate.routes.js';
/** Customer-facing enterprise/corporate routes. */
export async function registerCustomerCorporateRoutes(app: FastifyInstance): Promise<void> { await app.register(corporateRoutes); }
