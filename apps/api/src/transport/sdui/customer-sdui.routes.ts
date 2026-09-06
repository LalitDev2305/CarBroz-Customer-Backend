import type { FastifyInstance } from 'fastify';
import runtimeRoutes from './sdui-registry.routes.js';
/** Exposes SDUI runtime retrieval for CUSTOMER scope only. */
export async function registerCustomerSduiRoutes(app: FastifyInstance): Promise<void> { await app.register(runtimeRoutes); }
