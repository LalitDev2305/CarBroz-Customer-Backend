import type { FastifyInstance } from 'fastify';
import { PartnerOtpController } from '../controllers/partner-otp.controller.js';

/** Exposes the public SDUI document for the Partner OTP screen. */
export async function partnerOtpRoutes(app: FastifyInstance): Promise<void> {
  const controller = new PartnerOtpController();
  app.get('/auth_otp', controller.get);
}
