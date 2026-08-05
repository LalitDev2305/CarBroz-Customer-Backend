import { FastifyReply, FastifyRequest } from 'fastify';
export declare class HealthController {
    /**
     * Liveness Probe
     * Indicates whether the application process is up and running.
     */
    liveness(_request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * Readiness Probe
     * Verifies connectivity to core dependencies: Database, Storage, Maps, Push, SMS, Email.
     */
    readiness(request: FastifyRequest, reply: FastifyReply): Promise<never>;
}
