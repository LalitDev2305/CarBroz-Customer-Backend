import type { FastifyInstance } from 'fastify';
import runtimeRoutes from './sdui-registry.routes.js';
/** Exposes SDUI runtime retrieval for PARTNER scope only. */
export async function registerPartnerSduiRoutes(app: FastifyInstance): Promise<void> { await app.register(runtimeRoutes); }
