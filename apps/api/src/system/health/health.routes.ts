import { FastifyInstance } from 'fastify';
import { HealthController } from './health.controller.js';

export default async function healthRoutes(app: FastifyInstance) {
  const controller = new HealthController();

  app.get('/liveness', controller.liveness.bind(controller));
  app.get('/readiness', controller.readiness.bind(controller));
  
  // Root /health maps to liveness for simple checks
  app.get('/', controller.liveness.bind(controller));
}
