import { ResponseHelper } from '@carbroz/common';
import { applyCouponSchema, createCouponSchema, updateCouponSchema, validateCouponSchema, } from '../dtos/coupon.dto.js';
export async function couponRoutes(fastify) {
    fastify.post('/api/v1/coupons', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const body = createCouponSchema.parse(request.body);
        const useCase = fastify.diContainer.resolve('createCouponUseCase');
        const coupon = await useCase.execute({
            ...body,
            validFrom: new Date(body.validFrom),
            validUntil: new Date(body.validUntil),
        });
        return reply.status(201).send(ResponseHelper.created(coupon, 'Coupon created successfully'));
    });
    fastify.patch('/api/v1/coupons/:publicId', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const { publicId } = request.params;
        const body = updateCouponSchema.parse(request.body);
        const useCase = fastify.diContainer.resolve('updateCouponUseCase');
        const coupon = await useCase.execute({
            publicId,
            ...body,
            validFrom: body.validFrom ? new Date(body.validFrom) : undefined,
            validUntil: body.validUntil ? new Date(body.validUntil) : undefined,
        });
        return reply.send(ResponseHelper.success(coupon, 'Coupon updated successfully'));
    });
    fastify.delete('/api/v1/coupons/:publicId', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const { publicId } = request.params;
        const useCase = fastify.diContainer.resolve('archiveCouponUseCase');
        await useCase.execute(publicId);
        return reply.send(ResponseHelper.success(null, 'Coupon archived successfully'));
    });
    fastify.post('/api/v1/coupons/validate', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const body = validateCouponSchema.parse(request.body);
        const useCase = fastify.diContainer.resolve('validateCouponUseCase');
        const result = await useCase.execute({
            ...body,
            userId: request.user.id,
        });
        return reply.send(ResponseHelper.success(result, 'Coupon validated successfully'));
    });
    fastify.post('/api/v1/coupons/apply', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const body = applyCouponSchema.parse(request.body);
        const useCase = fastify.diContainer.resolve('applyCouponUseCase');
        const usage = await useCase.execute({
            ...body,
            userId: request.user.id,
        });
        return reply.status(201).send(ResponseHelper.created(usage, 'Coupon applied successfully'));
    });
    fastify.get('/api/v1/coupons', async (_request, reply) => {
        const useCase = fastify.diContainer.resolve('listCouponsUseCase');
        const coupons = await useCase.execute();
        return reply.send(ResponseHelper.success(coupons, 'Active coupons retrieved successfully'));
    });
}
//# sourceMappingURL=coupon.controller.js.map