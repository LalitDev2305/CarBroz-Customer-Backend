import { type FastifyInstance } from 'fastify';
import { AdminCorporateController } from './admin-corporate.controller.js';

export async function adminCorporateRoutes(fastify: FastifyInstance) {
  const controller = new AdminCorporateController();
  fastify.get('/accounts', { preHandler: [fastify.authenticate] }, (request, reply) => controller.listAccounts(request, reply));
  fastify.post('/accounts/:accountPublicId/approve', { preHandler: [fastify.authenticate] }, (request, reply) => controller.approveAccount(request, reply));
  fastify.post('/accounts/:accountPublicId/credit-limit', { preHandler: [fastify.authenticate] }, (request, reply) => controller.adjustCreditLimit(request, reply));
  fastify.post('/accounts/:accountPublicId/generate-invoice', { preHandler: [fastify.authenticate] }, (request, reply) => controller.generateInvoice(request, reply));
  fastify.post('/invoices/:invoicePublicId/reconcile-payment', { preHandler: [fastify.authenticate] }, (request, reply) => controller.reconcilePayment(request, reply));
}
