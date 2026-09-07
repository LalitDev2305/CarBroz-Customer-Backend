import type { FastifyInstance } from 'fastify';
import { PartnerBootstrapController } from '../controllers/partner.bootstrap.controller.js';

/** Registers the public Partner bootstrap endpoint with optional session awareness. */
export async function partnerBootstrapRoutes(fastify: FastifyInstance): Promise<void> {
  const controller = new PartnerBootstrapController();
  fastify.get('/bootstrap', controller.get.bind(controller));
}
