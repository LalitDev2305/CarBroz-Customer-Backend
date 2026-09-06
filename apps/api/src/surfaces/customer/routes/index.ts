import type { FastifyInstance } from 'fastify';
import appRoutes from './app.routes.js';
import customerRoutes from './customer.customer.routes.js';
import catalogRoutes from './catalog.catalog.routes.js';
import { configRoutes } from './config.config.routes.js';
import { mapsRoutes } from './maps.maps.routes.js';
import { registerCustomerAuthRoutes } from '../../../transport/auth/customer-auth.routes.js';
import { registerCustomerSduiRoutes } from '../../../transport/sdui/customer-sdui.routes.js';
import { registerCustomerReviewRoutes } from './review.routes.js';
import { registerCustomerCouponRoutes } from './coupon.routes.js';
import { registerCustomerDisputeRoutes } from './dispute.routes.js';
import { registerCustomerCorporateRoutes } from './corporate.routes.js';

/** Registers only Customer-product HTTP routes. */
export async function registerCustomerSurface(app: FastifyInstance): Promise<void> {
  await app.register(registerCustomerAuthRoutes, { prefix: '/auth' });
  await app.register(appRoutes, { prefix: '/app' });
  await app.register(configRoutes, { prefix: '/config' });
  await app.register(customerRoutes);
  await app.register(catalogRoutes, { prefix: '/catalog' });
  await app.register(mapsRoutes, { prefix: '/maps' });
  await app.register(registerCustomerSduiRoutes, { prefix: '/sdui' });
  await app.register(registerCustomerReviewRoutes, { prefix: '/reviews' });
  await app.register(registerCustomerCouponRoutes, { prefix: '/coupons' });
  await app.register(registerCustomerDisputeRoutes, { prefix: '/disputes' });
  await app.register(registerCustomerCorporateRoutes, { prefix: '/corporate' });
}
