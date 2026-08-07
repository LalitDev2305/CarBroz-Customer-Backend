import { diContainer } from '@fastify/awilix';
export async function adminKycRoutes(fastify) {
    const adminKycController = diContainer.resolve('adminKycController');
    fastify.post('/:documentId/review', {
        preValidation: [fastify.authenticate, fastify.requirePermission('partners.manage')]
    }, adminKycController.reviewDocument.bind(adminKycController));
}
//# sourceMappingURL=admin-kyc.routes.js.map