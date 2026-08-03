import { diContainer } from '@fastify/awilix';
export async function kycRoutes(fastify) {
    const kycController = diContainer.resolve('kycController');
    fastify.post('/kyc', {
        preValidation: [fastify.authenticate]
    }, kycController.upload.bind(kycController));
    fastify.get('/:partnerId/kyc', {
        preValidation: [fastify.authenticate]
    }, kycController.getStatus.bind(kycController));
}
//# sourceMappingURL=kyc.routes.js.map