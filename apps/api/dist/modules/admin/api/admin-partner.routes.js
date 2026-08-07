import { AdminPartnerController } from './admin-partner.controller.js';
export async function adminPartnerRoutes(fastify) {
    const controller = new AdminPartnerController();
    fastify.patch('/:id/verify', {
        preValidation: [fastify.authenticate, fastify.requirePermission('partners.manage')]
    }, controller.verifyPartner.bind(controller));
}
//# sourceMappingURL=admin-partner.routes.js.map