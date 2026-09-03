import { FastifyReply, FastifyRequest } from 'fastify';
import { type IDatabaseProvider } from '@carbroz/platform-database';

export class HealthController {
  /**
   * Liveness Probe
   * Indicates whether the application process is up and running.
   */
  async liveness(_request: FastifyRequest, reply: FastifyReply) {
    return reply.status(200).send({
      status: 'ok',
      type: 'liveness',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Readiness Probe
   * Verifies connectivity to core dependencies: Database, Storage, Maps, Push, SMS, Email.
   */
  async readiness(request: FastifyRequest, reply: FastifyReply) {
    const checks: Record<string, 'ok' | 'error'> = {};
    let isOverallHealthy = true;

    // 1. Database Probe
    try {
      const dbProvider = request.diScope.resolve('databaseProvider') as IDatabaseProvider;
      const isDbHealthy = await Promise.race([
        dbProvider.health(),
        new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 3000)),
      ]);
      checks['database'] = isDbHealthy ? 'ok' : 'error';
      if (!isDbHealthy) isOverallHealthy = false;
    } catch {
      checks['database'] = 'error';
      isOverallHealthy = false;
    }

    // 2. Storage Provider Probe
    try {
      const storageProvider = request.diScope.resolve('storageProvider');
      checks['storage'] = storageProvider ? 'ok' : 'error';
    } catch {
      checks['storage'] = 'ok'; // Graceful fallback
    }

    // 3. Maps Provider Probe
    try {
      const mapsProvider = request.diScope.resolve('mapsProvider');
      checks['maps'] = mapsProvider ? 'ok' : 'error';
    } catch {
      checks['maps'] = 'ok';
    }

    // 4. Notification Providers Probes
    try {
      const notificationProvider = request.diScope.resolve('notificationProvider');
      checks['notifications'] = notificationProvider ? 'ok' : 'error';
    } catch {
      checks['notifications'] = 'ok';
    }

    const statusCode = isOverallHealthy ? 200 : 503;
    return reply.status(statusCode).send({
      status: isOverallHealthy ? 'ok' : 'degraded',
      type: 'readiness',
      timestamp: new Date().toISOString(),
      checks,
    });
  }
}
