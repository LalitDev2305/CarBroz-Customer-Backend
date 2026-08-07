import fp from 'fastify-plugin';
import { randomUUID } from 'crypto';
const requestContextPlugin = async (fastify) => {
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
//# sourceMappingURL=request-context.js.map