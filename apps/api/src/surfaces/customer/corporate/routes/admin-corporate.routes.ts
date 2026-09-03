import { FastifyInstance } from 'fastify';
import { AdminCorporateController } from '../controllers/AdminCorporateController.js';

export async function adminCorporateRoutes(fastify: FastifyInstance) {
  const controller = new AdminCorporateController();

  fastify.get('/accounts', { preHandler: [fastify.authenticate] }, (req, reply) => controller.listAccounts(req, reply));
  fastify.post('/accounts/:accountPublicId/approve', { preHandler: [fastify.authenticate] }, (req, reply) => controller.approveAccount(req, reply));
  fastify.post('/accounts/:accountPublicId/credit-limit', { preHandler: [fastify.authenticate] }, (req, reply) => controller.adjustCreditLimit(req, reply));
  fastify.post('/accounts/:accountPublicId/generate-invoice', { preHandler: [fastify.authenticate] }, (req, reply) => controller.generateInvoice(req, reply));
  fastify.post('/invoices/:invoicePublicId/reconcile-payment', { preHandler: [fastify.authenticate] }, (req, reply) => controller.reconcilePayment(req, reply));
}
