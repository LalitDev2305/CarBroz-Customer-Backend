import { FastifyReply, FastifyRequest } from 'fastify';
import { IDatabaseProvider } from '@carbroz/common';

export class HealthController {
  /**
   * Liveness Probe
   * Simply returns 200 OK to indicate the application process is running.
   */
  async liveness(request: FastifyRequest, reply: FastifyReply) {
    return reply.status(200).send({ status: 'ok', type: 'liveness' });
  }

  /**
   * Readiness Probe
   * In future phases, this will check DB and Redis connections.
   * For Phase 2, it returns 200 OK if the app booted successfully.
   */
  async readiness(request: FastifyRequest, reply: FastifyReply) {
    const dbProvider = request.diScope.resolve('databaseProvider') as IDatabaseProvider;
    const isHealthy = await dbProvider.health();

    if (!isHealthy) {
      return reply.status(503).send({ status: 'error', message: 'Database connection failed' });
    }
    
    // TODO: Phase 4+ - Add Redis connection check
    
    return reply.status(200).send({ status: 'ok', type: 'readiness' });
  }
}
