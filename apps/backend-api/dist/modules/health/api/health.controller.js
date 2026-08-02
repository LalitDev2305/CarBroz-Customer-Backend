export class HealthController {
    /**
     * Liveness Probe
     * Simply returns 200 OK to indicate the application process is running.
     */
    async liveness(request, reply) {
        return reply.status(200).send({ status: 'ok', type: 'liveness' });
    }
    /**
     * Readiness Probe
     * In future phases, this will check DB and Redis connections.
     * For Phase 2, it returns 200 OK if the app booted successfully.
     */
    async readiness(request, reply) {
        const dbProvider = request.diScope.resolve('databaseProvider');
        const isHealthy = await dbProvider.health();
        if (!isHealthy) {
            return reply.status(503).send({ status: 'error', message: 'Database connection failed' });
        }
        // TODO: Phase 4+ - Add Redis connection check
        return reply.status(200).send({ status: 'ok', type: 'readiness' });
    }
}
//# sourceMappingURL=health.controller.js.map