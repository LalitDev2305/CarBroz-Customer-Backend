import { FastifyPluginAsync } from 'fastify';
declare module 'fastify' {
    interface FastifyRequest {
        traceId: string;
        requestStartTime: number;
    }
}
declare const _default: FastifyPluginAsync;
export default _default;
