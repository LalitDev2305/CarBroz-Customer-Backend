import { ResponseHelper } from '../../../transport/response/ResponseHelper.js';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import { CreateCouponUseCase } from '@carbroz/domain-engagement';
import { UpdateCouponUseCase } from '@carbroz/domain-engagement';
import { ArchiveCouponUseCase } from '@carbroz/domain-engagement';
import { ValidateCouponUseCase } from '@carbroz/domain-engagement';
import { ApplyCouponUseCase } from '@carbroz/domain-engagement';
import { ListCouponsUseCase } from '@carbroz/domain-engagement';
import { applyCouponSchema, createCouponSchema, updateCouponSchema, validateCouponSchema } from './dto/coupon.dto.js';

export async function couponRoutes(fastify: FastifyInstance) {
  fastify.post(
    '/api/v1/coupons',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = createCouponSchema.parse(request.body);
      const useCase: CreateCouponUseCase = fastify.diContainer.resolve('createCouponUseCase');

      const coupon = await useCase.execute({
        ...body,
        validFrom: new Date(body.validFrom),
        validUntil: new Date(body.validUntil),
      });

      return reply.status(201).send(ResponseHelper.created(coupon, 'Coupon created successfully'));
    }
  );

  fastify.patch(
    '/api/v1/coupons/:publicId',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { publicId } = request.params as { publicId: string };
      const body = updateCouponSchema.parse(request.body);
      const useCase: UpdateCouponUseCase = fastify.diContainer.resolve('updateCouponUseCase');

      const coupon = await useCase.execute({
        publicId,
        ...body,
        validFrom: body.validFrom ? new Date(body.validFrom) : undefined,
        validUntil: body.validUntil ? new Date(body.validUntil) : undefined,
      });

      return reply.send(ResponseHelper.success(coupon, 'Coupon updated successfully'));
    }
  );

  fastify.delete(
    '/api/v1/coupons/:publicId',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { publicId } = request.params as { publicId: string };
      const useCase: ArchiveCouponUseCase = fastify.diContainer.resolve('archiveCouponUseCase');

      await useCase.execute(publicId);

      return reply.send(ResponseHelper.success(null, 'Coupon archived successfully'));
    }
  );

  fastify.post(
    '/api/v1/coupons/validate',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = validateCouponSchema.parse(request.body);
      const useCase: ValidateCouponUseCase = fastify.diContainer.resolve('validateCouponUseCase');

      const result = await useCase.execute({
        ...body,
        userId: (request.user as any).id,
      });

      return reply.send(ResponseHelper.success(result, 'Coupon validated successfully'));
    }
  );

  fastify.post(
    '/api/v1/coupons/apply',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = applyCouponSchema.parse(request.body);
      const useCase: ApplyCouponUseCase = fastify.diContainer.resolve('applyCouponUseCase');

      const usage = await useCase.execute({
        ...body,
        userId: (request.user as any).id,
      });

      return reply.status(201).send(ResponseHelper.created(usage, 'Coupon applied successfully'));
    }
  );

  fastify.get(
    '/api/v1/coupons',
    async (_request: FastifyRequest, reply: FastifyReply) => {
      const useCase: ListCouponsUseCase = fastify.diContainer.resolve('listCouponsUseCase');
      const coupons = await useCase.execute();

      return reply.send(ResponseHelper.success(coupons, 'Active coupons retrieved successfully'));
    }
  );
}
