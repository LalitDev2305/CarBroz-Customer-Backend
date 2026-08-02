import { AuthController } from './auth.controller.js';
export default async function authRoutes(fastify) {
    const controller = new AuthController();
    // Public routes
    fastify.post('/send_otp', controller.sendOtp.bind(controller));
    fastify.post('/verify_otp', controller.verifyOtp.bind(controller));
    fastify.post('/refresh', controller.refresh.bind(controller));
    fastify.post('/guest', controller.guestLogin.bind(controller));
    fastify.post('/logout', controller.logout.bind(controller));
    fastify.post('/logout-all', controller.logoutAll.bind(controller));
    fastify.get('/me', controller.me.bind(controller));
}
//# sourceMappingURL=auth.routes.js.map