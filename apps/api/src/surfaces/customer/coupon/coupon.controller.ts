import { type FastifyInstance, type FastifyReply, type FastifyRequest } from 'fastify';
import { ApplyCouponUseCase, ListCouponsUseCase, ValidateCouponUseCase } from '@carbroz/domain-engagement';
import { ResponseHelper } from '../../../transport/response/ResponseHelper.js';
import { applyCouponSchema, validateCouponSchema } from './dto/coupon.dto.js';

export async function couponRoutes(fastify: FastifyInstance) {
  fastify.post(
    '/coupons/validate',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = validateCouponSchema.parse(request.body);
      const useCase = fastify.diContainer.resolve('validateCouponUseCase') as ValidateCouponUseCase;
      const result = await useCase.execute({ ...body, userId: (request.user as any).id });
      return reply.send(ResponseHelper.success(result, 'Coupon validated successfully'));
    },
  );

  fastify.post(
    '/coupons/apply',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = applyCouponSchema.parse(request.body);
      const useCase = fastify.diContainer.resolve('applyCouponUseCase') as ApplyCouponUseCase;
      const usage = await useCase.execute({ ...body, userId: (request.user as any).id });
      return reply.status(201).send(ResponseHelper.created(usage, 'Coupon applied successfully'));
    },
  );

  fastify.get('/coupons', async (_request: FastifyRequest, reply: FastifyReply) => {
    const useCase = fastify.diContainer.resolve('listCouponsUseCase') as ListCouponsUseCase;
    const coupons = await useCase.execute();
    return reply.send(ResponseHelper.success(coupons, 'Active coupons retrieved successfully'));
  });
}
