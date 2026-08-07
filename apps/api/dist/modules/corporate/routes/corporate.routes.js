import { CorporateController } from '../controllers/CorporateController.js';
import { createCorporateAuthMiddleware, requireCorporateRole } from '../middleware/corporateAuth.middleware.js';
export async function corporateRoutes(fastify) {
    const controller = new CorporateController();
    const corporateAuth = async (req, reply) => {
        const corporateMemberRepo = (req.diScope || fastify.diContainer).resolve('corporateMemberRepo');
        const middleware = createCorporateAuthMiddleware(corporateMemberRepo);
        await middleware(req, reply);
    };
    fastify.post('/register', { preHandler: [fastify.authenticate] }, (req, reply) => controller.registerAccount(req, reply));
    fastify.get('/profile', { preHandler: [fastify.authenticate, corporateAuth] }, (req, reply) => controller.getProfile(req, reply));
    fastify.post('/members', { preHandler: [fastify.authenticate, corporateAuth, requireCorporateRole(['CORP_ADMIN'])] }, (req, reply) => controller.addMember(req, reply));
    fastify.get('/members', { preHandler: [fastify.authenticate, corporateAuth] }, (req, reply) => controller.listMembers(req, reply));
    fastify.delete('/members/:memberPublicId', { preHandler: [fastify.authenticate, corporateAuth, requireCorporateRole(['CORP_ADMIN'])] }, (req, reply) => controller.removeMember(req, reply));
    fastify.post('/fleet', { preHandler: [fastify.authenticate, corporateAuth, requireCorporateRole(['CORP_ADMIN', 'FLEET_MANAGER'])] }, (req, reply) => controller.enrollFleetVehicle(req, reply));
    fastify.get('/fleet', { preHandler: [fastify.authenticate, corporateAuth] }, (req, reply) => controller.listFleetVehicles(req, reply));
    fastify.delete('/fleet/:fleetVehiclePublicId', { preHandler: [fastify.authenticate, corporateAuth, requireCorporateRole(['CORP_ADMIN', 'FLEET_MANAGER'])] }, (req, reply) => controller.removeFleetVehicle(req, reply));
    fastify.get('/credit-ledger', { preHandler: [fastify.authenticate, corporateAuth, requireCorporateRole(['CORP_ADMIN'])] }, (req, reply) => controller.getCreditLedger(req, reply));
    fastify.get('/invoices', { preHandler: [fastify.authenticate, corporateAuth, requireCorporateRole(['CORP_ADMIN'])] }, (req, reply) => controller.listInvoices(req, reply));
}
//# sourceMappingURL=corporate.routes.js.map