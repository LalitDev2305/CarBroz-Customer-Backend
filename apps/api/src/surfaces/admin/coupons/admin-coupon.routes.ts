import { type FastifyInstance, type FastifyReply, type FastifyRequest } from 'fastify';
import {
  ArchiveCouponUseCase,
  CreateCouponUseCase,
  UpdateCouponUseCase,
} from '@carbroz/domain-engagement';
import { ResponseHelper } from '../../../transport/response/ResponseHelper.js';
import { createAdminCouponSchema, updateAdminCouponSchema } from './admin-coupon.dto.js';

export async function adminCouponRoutes(fastify: FastifyInstance) {
  fastify.post('/', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const body = createAdminCouponSchema.parse(request.body);
    const useCase = fastify.diContainer.resolve('createCouponUseCase') as CreateCouponUseCase;
    const coupon = await useCase.execute({
      ...body,
      validFrom: new Date(body.validFrom),
      validUntil: new Date(body.validUntil),
    });
    return reply.status(201).send(ResponseHelper.created(coupon, 'Coupon created successfully'));
  });

  fastify.patch('/:publicId', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { publicId } = request.params as { publicId: string };
    const body = updateAdminCouponSchema.parse(request.body);
    const useCase = fastify.diContainer.resolve('updateCouponUseCase') as UpdateCouponUseCase;
    const coupon = await useCase.execute({
      publicId,
      ...body,
      validFrom: body.validFrom ? new Date(body.validFrom) : undefined,
      validUntil: body.validUntil ? new Date(body.validUntil) : undefined,
    });
    return reply.send(ResponseHelper.success(coupon, 'Coupon updated successfully'));
  });

  fastify.delete('/:publicId', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { publicId } = request.params as { publicId: string };
    const useCase = fastify.diContainer.resolve('archiveCouponUseCase') as ArchiveCouponUseCase;
    await useCase.execute(publicId);
    return reply.send(ResponseHelper.success(null, 'Coupon archived successfully'));
  });
}
