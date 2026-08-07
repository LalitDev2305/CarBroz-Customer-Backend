import { FastifyInstance } from 'fastify';
import { AdminKycController } from './admin-kyc.controller.js';
import { diContainer } from '@fastify/awilix';

export async function adminKycRoutes(fastify: FastifyInstance) {
  const adminKycController = diContainer.resolve<AdminKycController>('adminKycController');

  fastify.post<{ Params: { documentId: string } }>('/:documentId/review', {
    preValidation: [fastify.authenticate, fastify.requirePermission('partners.manage')]
  }, adminKycController.reviewDocument.bind(adminKycController));
}
