import { FastifyInstance } from 'fastify';
import { AppController } from '../transport/controllers/AppController.js';

export default async function appRoutes(fastify: FastifyInstance) {
  const appController = new AppController();

  // App initialization API (Splash Config)
  fastify.get('/init', appController.init);
}
