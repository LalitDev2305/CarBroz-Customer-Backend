import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ApplyCouponUseCase, ListCouponsUseCase, ValidateCouponUseCase } from '@carbroz/domain-engagement';
import { ResponseHelper } from '../../../transport/response/ResponseHelper.js';
import { applyCouponSchema, validateCouponSchema } from '../dto/coupon.dto.js';
/** Customer coupon discovery/validation/application endpoints. */
export async function registerCustomerCouponRoutes(app: FastifyInstance): Promise<void> {
  app.get('/', async (_request, reply) => { const uc = app.diContainer.resolve<ListCouponsUseCase>('listCouponsUseCase'); return reply.send(ResponseHelper.success(await uc.execute(), 'Active coupons retrieved successfully')); });
  app.post('/validate', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => { const body = validateCouponSchema.parse(request.body); const uc = app.diContainer.resolve<ValidateCouponUseCase>('validateCouponUseCase'); return reply.send(ResponseHelper.success(await uc.execute({ ...body, userId: Number(request.user.id) }), 'Coupon validated successfully')); });
  app.post('/apply', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => { const body = applyCouponSchema.parse(request.body); const uc = app.diContainer.resolve<ApplyCouponUseCase>('applyCouponUseCase'); return reply.status(201).send(ResponseHelper.created(await uc.execute({ ...body, userId: Number(request.user.id) }), 'Coupon applied successfully')); });
}
