import { PartnerController } from './partner.controller.js';
export async function partnerRoutes(fastify) {
    const controller = new PartnerController();
    fastify.post('/register/individual', {
        preValidation: [fastify.authenticate]
    }, controller.registerIndividual.bind(controller));
    fastify.post('/register/organization', {
        preValidation: [fastify.authenticate]
    }, controller.registerOrganization.bind(controller));
    fastify.get('/me', {
        preValidation: [fastify.authenticate]
    }, controller.getProfile.bind(controller));
}
//# sourceMappingURL=partner.routes.js.map