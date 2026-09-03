import { ResponseHelper } from '../response/ResponseHelper.js';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { StartTrackingSessionUseCase } from '@carbroz/domain-operations';
import { UpdateLocationPingUseCase } from '@carbroz/domain-operations';
import { GetCurrentTrackingUseCase } from '@carbroz/domain-operations';
import { EndTrackingSessionUseCase } from '@carbroz/domain-operations';
import { endTrackingSchema, startTrackingSchema, updateLocationPingSchema } from '../dtos/tracking.dto.js';


export async function trackingRoutes(fastify: FastifyInstance) {
  fastify.post(
    '/api/v1/tracking/start',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = startTrackingSchema.parse(request.body);
      const useCase: StartTrackingSessionUseCase = fastify.diContainer.resolve('startTrackingSessionUseCase');

      const session = await useCase.execute({
        ...body,
        partnerUserId: (request.user as any).id,
      });

      return reply.send(ResponseHelper.success(session, 'Tracking session started successfully'));
    }
  );

  fastify.post(
    '/api/v1/tracking/ping',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = updateLocationPingSchema.parse(request.body);
      const useCase: UpdateLocationPingUseCase = fastify.diContainer.resolve('updateLocationPingUseCase');

      const session = await useCase.execute(body);

      return reply.send(ResponseHelper.success(session, 'Location ping updated successfully'));
    }
  );

  fastify.get(
    '/api/v1/tracking/current',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { bookingPublicId } = request.query as { bookingPublicId: string };
      const useCase: GetCurrentTrackingUseCase = fastify.diContainer.resolve('getCurrentTrackingUseCase');

      const session = await useCase.execute(bookingPublicId);

      return reply.send(ResponseHelper.success(session, 'Current tracking session retrieved successfully'));
    }
  );

  fastify.get(
    '/api/v1/tracking/stream/:bookingPublicId',
    async (request: FastifyRequest<{ Params: { bookingPublicId: string } }>, reply: FastifyReply) => {
      const { bookingPublicId } = request.params;
      const useCase: GetCurrentTrackingUseCase = fastify.diContainer.resolve('getCurrentTrackingUseCase');

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
    }
  );

  fastify.post(
    '/api/v1/tracking/end',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = endTrackingSchema.parse(request.body);
      const useCase: EndTrackingSessionUseCase = fastify.diContainer.resolve('endTrackingSessionUseCase');

      const session = await useCase.execute(body.bookingPublicId);

      return reply.send(ResponseHelper.success(session, 'Tracking session ended successfully'));
    }
  );
}
