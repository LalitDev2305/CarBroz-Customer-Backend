import type { FastifyInstance } from 'fastify';
import { PartnerLoginController } from '../controllers/partner-login.controller.js';

/** Exposes the public SDUI document for the Partner Login screen. */
export async function partnerLoginRoutes(app: FastifyInstance): Promise<void> {
  const controller = new PartnerLoginController();
  app.get('/auth_login', controller.get);
}
