import { deactivateDeviceTokenSchema, registerDeviceTokenSchema, sendNotificationSchema } from '../dtos/notification.dto.js';
import { ResponseHelper } from '@carbroz/foundation-kernel';
export async function notificationRoutes(fastify) {
    fastify.post('/api/v1/notifications/device-token', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const body = registerDeviceTokenSchema.parse(request.body);
        const useCase = fastify.diContainer.resolve('registerDeviceTokenUseCase');
        const token = await useCase.execute({
            ...body,
            userId: request.user.id,
        });
        return reply.send(ResponseHelper.success(token, 'Device token registered successfully'));
    });
    fastify.patch('/api/v1/notifications/device-token', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const body = registerDeviceTokenSchema.parse(request.body);
        const useCase = fastify.diContainer.resolve('registerDeviceTokenUseCase');
        const token = await useCase.execute({
            ...body,
            userId: request.user.id,
        });
        return reply.send(ResponseHelper.success(token, 'Device token updated successfully'));
    });
    fastify.delete('/api/v1/notifications/device-token', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const body = deactivateDeviceTokenSchema.parse(request.body);
        const useCase = fastify.diContainer.resolve('deactivateDeviceTokenUseCase');
        await useCase.execute({
            userId: request.user.id,
            deviceId: body.deviceId,
        });
        return reply.send(ResponseHelper.success({ success: true }, 'Device token deactivated successfully'));
    });
    fastify.post('/api/v1/notifications/send', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const body = sendNotificationSchema.parse(request.body);
        const useCase = fastify.diContainer.resolve('sendNotificationUseCase');
        const log = await useCase.execute(body);
        return reply.send(ResponseHelper.success(log, 'Notification dispatched successfully'));
    });
    fastify.get('/api/v1/notifications/history', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const { limit, offset } = request.query;
        const useCase = fastify.diContainer.resolve('listNotificationHistoryUseCase');
        const logs = await useCase.execute({
            recipientId: request.user.id,
            limit: limit ? parseInt(limit, 10) : 50,
            offset: offset ? parseInt(offset, 10) : 0,
        });
        return reply.send(ResponseHelper.success(logs, 'Notification history retrieved successfully'));
    });
}
//# sourceMappingURL=notification.controller.js.map