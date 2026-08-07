import { FastifyInstance } from 'fastify';
import { KycController } from './kyc.controller.js';
import { diContainer } from '@fastify/awilix';

export async function kycRoutes(fastify: FastifyInstance) {
  const kycController = diContainer.resolve<KycController>('kycController');

  fastify.post('/kyc', {
    preValidation: [fastify.authenticate]
  }, kycController.upload.bind(kycController));
  
  fastify.get<{ Params: { partnerId: string } }>('/:partnerId/kyc', {
    preValidation: [fastify.authenticate]
  }, kycController.getStatus.bind(kycController));
}
