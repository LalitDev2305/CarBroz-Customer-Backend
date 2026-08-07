import { endTrackingSchema, startTrackingSchema, updateLocationPingSchema } from '../dtos/tracking.dto.js';
import { ResponseHelper } from '@carbroz/foundation-kernel';
export async function trackingRoutes(fastify) {
    fastify.post('/api/v1/tracking/start', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const body = startTrackingSchema.parse(request.body);
        const useCase = fastify.diContainer.resolve('startTrackingSessionUseCase');
        const session = await useCase.execute({
            ...body,
            partnerUserId: request.user.id,
        });
        return reply.send(ResponseHelper.success(session, 'Tracking session started successfully'));
    });
    fastify.post('/api/v1/tracking/ping', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const body = updateLocationPingSchema.parse(request.body);
        const useCase = fastify.diContainer.resolve('updateLocationPingUseCase');
        const session = await useCase.execute(body);
        return reply.send(ResponseHelper.success(session, 'Location ping updated successfully'));
    });
    fastify.get('/api/v1/tracking/current', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const { bookingPublicId } = request.query;
        const useCase = fastify.diContainer.resolve('getCurrentTrackingUseCase');
        const session = await useCase.execute(bookingPublicId);
        return reply.send(ResponseHelper.success(session, 'Current tracking session retrieved successfully'));
    });
    fastify.get('/api/v1/tracking/stream/:bookingPublicId', async (request, reply) => {
        const { bookingPublicId } = request.params;
        const useCase = fastify.diContainer.resolve('getCurrentTrackingUseCase');
        reply.raw.setHeader('Content-Type', 'text/event-stream');
        reply.raw.setHeader('Cache-Control', 'no-cache');
        reply.raw.setHeader('Connection', 'keep-alive');
        reply.raw.setHeader('Access-Control-Allow-Origin', '*');
        const session = await useCase.execute(bookingPublicId);
        const dataPayload = JSON.stringify({
            bookingPublicId,
            latitude: session?.currentLatitude ?? null,
            longitude: session?.currentLongitude ?? null,
            etaMinutes: session?.etaMinutes ?? null,
            status: session?.status ?? 'INACTIVE',
        });
        reply.raw.write(`id: ${Date.now()}\n`);
        reply.raw.write(`event: location_update\n`);
        reply.raw.write(`data: ${dataPayload}\n\n`);
        // Send 15-second SSE heartbeat ping
        const heartbeatInterval = setInterval(() => {
            if (reply.raw.writableEnded) {
                clearInterval(heartbeatInterval);
                return;
            }
            reply.raw.write(`: heartbeat ${new Date().toISOString()}\n\n`);
        }, 15000);
        request.raw.on('close', () => {
            clearInterval(heartbeatInterval);
        });
    });
    fastify.post('/api/v1/tracking/end', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const body = endTrackingSchema.parse(request.body);
        const useCase = fastify.diContainer.resolve('endTrackingSessionUseCase');
        const session = await useCase.execute(body.bookingPublicId);
        return reply.send(ResponseHelper.success(session, 'Tracking session ended successfully'));
    });
}
//# sourceMappingURL=tracking.controller.js.map