import { FastifyInstance } from 'fastify';
import { CustomerController } from './customer.controller.js';
import { diContainer } from '@fastify/awilix';

export default async function customerRoutes(fastify: FastifyInstance) {
  const customerController = new CustomerController(
    diContainer.resolve('getCustomerProfileUseCase'),
    diContainer.resolve('updateCustomerProfileUseCase'),
    diContainer.resolve('manageAddressUseCase'),
    diContainer.resolve('extractCustomerDataUseCase')
  );

  fastify.addHook('onRequest', fastify.authenticate);

  // Profile Routes
  fastify.get('/profile', customerController.getProfile.bind(customerController));
  fastify.put('/profile', customerController.updateProfile.bind(customerController));

  // Address Routes
  fastify.get('/addresses', customerController.getAddresses.bind(customerController));
  fastify.post('/addresses', customerController.addAddress.bind(customerController));
  fastify.put('/addresses/:addressId', customerController.updateAddress.bind(customerController));
  fastify.delete('/addresses/:addressId', customerController.deleteAddress.bind(customerController));

  // GDPR Data Extraction
  fastify.get('/gdpr', customerController.extractData.bind(customerController));
}
