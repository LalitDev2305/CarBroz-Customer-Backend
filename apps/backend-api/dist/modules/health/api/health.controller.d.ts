import { FastifyReply, FastifyRequest } from 'fastify';
export declare class HealthController {
    /**
     * Liveness Probe
     * Simply returns 200 OK to indicate the application process is running.
     */
    liveness(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * Readiness Probe
     * In future phases, this will check DB and Redis connections.
     * For Phase 2, it returns 200 OK if the app booted successfully.
     */
    readiness(request: FastifyRequest, reply: FastifyReply): Promise<never>;
}
