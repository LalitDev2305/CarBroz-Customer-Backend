import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import { randomUUID } from 'crypto';

declare module 'fastify' {
  interface FastifyRequest {
    traceId: string;
    requestStartTime: number;
  }
}

const requestContextPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorateRequest('traceId', '');
  fastify.decorateRequest('requestStartTime', 0);

  fastify.addHook('onRequest', async (request) => {
    request.traceId = request.id || randomUUID();
    request.requestStartTime = Date.now();
  });
};

export default fp(requestContextPlugin, {
  name: 'request-context',
});
