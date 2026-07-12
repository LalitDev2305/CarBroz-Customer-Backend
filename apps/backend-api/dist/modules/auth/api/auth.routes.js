import { AuthController } from './auth.controller.js';
export default async function authRoutes(fastify) {
    const authController = new AuthController();
    fastify.post('/send-otp', authController.sendOtp);
    fastify.post('/verify-otp', authController.verifyOtp);
    fastify.post('/refresh', authController.refresh);
    fastify.post('/logout', authController.logout);
    fastify.post('/logout-all', authController.logoutAll);
    fastify.get('/me', authController.me);
}
//# sourceMappingURL=auth.routes.js.map