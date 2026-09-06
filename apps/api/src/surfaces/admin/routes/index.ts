import type { FastifyInstance } from 'fastify';
import { adminPartnerRoutes } from './admin-partner.routes.js';
import { adminKycRoutes } from './admin-kyc.routes.js';
import adminCatalogRoutes from './admin-catalog.routes.js';
import adminSduiRoutes from './admin-sdui.routes.js';
import { registerAdminReviewRoutes } from './review.routes.js';
import { registerAdminCouponRoutes } from './coupon.routes.js';
import { registerAdminDisputeRoutes } from './dispute.routes.js';
import { registerAdminCorporateRoutes } from './corporate.routes.js';

/** Registers only Admin control-plane HTTP routes; Admin has no SDUI runtime scope of its own. */
export async function registerAdminSurface(app: FastifyInstance): Promise<void> {
  await app.register(adminPartnerRoutes, { prefix: '/partners' });
  await app.register(adminKycRoutes, { prefix: '/kyc' });
  await app.register(adminCatalogRoutes, { prefix: '/catalog' });
  await app.register(adminSduiRoutes, { prefix: '/sdui' });
  await app.register(registerAdminReviewRoutes, { prefix: '/reviews' });
  await app.register(registerAdminCouponRoutes, { prefix: '/coupons' });
  await app.register(registerAdminDisputeRoutes, { prefix: '/disputes' });
  await app.register(registerAdminCorporateRoutes, { prefix: '/corporate' });
}
