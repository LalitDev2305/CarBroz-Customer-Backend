import { FastifyInstance } from 'fastify';
import { AuthController } from './auth.controller.js';

export default async function authRoutes(fastify: FastifyInstance) {
  const authController = new AuthController();

  fastify.post('/send_otp', authController.sendOtp);
  fastify.post('/verify_otp', authController.verifyOtp);
  fastify.post('/refresh', authController.refresh);
  fastify.post('/logout', authController.logout);
  fastify.post('/logout-all', authController.logoutAll);
  fastify.get('/me', authController.me);
}
