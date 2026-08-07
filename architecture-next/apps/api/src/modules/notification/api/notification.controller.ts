import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { RegisterDeviceTokenUseCase } from '../use-cases/RegisterDeviceTokenUseCase.js';
import { DeactivateDeviceTokenUseCase } from '../use-cases/DeactivateDeviceTokenUseCase.js';
import { SendNotificationUseCase } from '../use-cases/SendNotificationUseCase.js';
import { ListNotificationHistoryUseCase } from '../use-cases/ListNotificationHistoryUseCase.js';
import { deactivateDeviceTokenSchema, registerDeviceTokenSchema, sendNotificationSchema } from '../dtos/notification.dto.js';
import { ResponseHelper } from '@carbroz/common';

export async function notificationRoutes(fastify: FastifyInstance) {
  fastify.post(
    '/api/v1/notifications/device-token',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = registerDeviceTokenSchema.parse(request.body);
      const useCase: RegisterDeviceTokenUseCase = fastify.diContainer.resolve('registerDeviceTokenUseCase');

      const token = await useCase.execute({
        ...body,
        userId: (request.user as any).id,
      });

      return reply.send(ResponseHelper.success(token, 'Device token registered successfully'));
    }
  );

  fastify.patch(
    '/api/v1/notifications/device-token',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = registerDeviceTokenSchema.parse(request.body);
      const useCase: RegisterDeviceTokenUseCase = fastify.diContainer.resolve('registerDeviceTokenUseCase');

      const token = await useCase.execute({
        ...body,
        userId: (request.user as any).id,
      });

      return reply.send(ResponseHelper.success(token, 'Device token updated successfully'));
    }
  );

  fastify.delete(
    '/api/v1/notifications/device-token',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = deactivateDeviceTokenSchema.parse(request.body);
      const useCase: DeactivateDeviceTokenUseCase = fastify.diContainer.resolve('deactivateDeviceTokenUseCase');

      await useCase.execute({
        userId: (request.user as any).id,
        deviceId: body.deviceId,
      });

      return reply.send(ResponseHelper.success({ success: true }, 'Device token deactivated successfully'));
    }
  );

  fastify.post(
    '/api/v1/notifications/send',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = sendNotificationSchema.parse(request.body);
      const useCase: SendNotificationUseCase = fastify.diContainer.resolve('sendNotificationUseCase');

      const log = await useCase.execute(body);

      return reply.send(ResponseHelper.success(log, 'Notification dispatched successfully'));
    }
  );

  fastify.get(
    '/api/v1/notifications/history',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { limit, offset } = request.query as { limit?: string; offset?: string };
      const useCase: ListNotificationHistoryUseCase = fastify.diContainer.resolve('listNotificationHistoryUseCase');

      const logs = await useCase.execute({
        recipientId: (request.user as any).id,
        limit: limit ? parseInt(limit, 10) : 50,
        offset: offset ? parseInt(offset, 10) : 0,
      });

      return reply.send(ResponseHelper.success(logs, 'Notification history retrieved successfully'));
    }
  );
}
