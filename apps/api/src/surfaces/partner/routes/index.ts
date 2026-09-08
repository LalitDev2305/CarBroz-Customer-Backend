import type { FastifyInstance } from 'fastify';
import { partnerRoutes } from './partner.partner.routes.js';
import { kycRoutes } from './partner.kyc.routes.js';
import { partnerBootstrapRoutes } from './partner.bootstrap.routes.js';
import { partnerLoginRoutes } from './partner-login.routes.js';
import { registerPartnerAuthRoutes } from '../../../transport/auth/partner-auth.routes.js';
import { registerPartnerSduiRoutes } from '../../../transport/sdui/partner-sdui.routes.js';

/** Registers only Partner-product HTTP routes. */
export async function registerPartnerSurface(app: FastifyInstance): Promise<void> {
  await app.register(partnerBootstrapRoutes);
  await app.register(partnerLoginRoutes);
  await app.register(registerPartnerAuthRoutes, { prefix: '/auth' });
  await app.register(partnerRoutes);
  await app.register(kycRoutes);
  await app.register(registerPartnerSduiRoutes, { prefix: '/sdui' });
}
