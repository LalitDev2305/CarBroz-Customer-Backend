import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ArchiveCouponUseCase, CreateCouponUseCase, UpdateCouponUseCase } from '@carbroz/domain-engagement';
import { ResponseHelper } from '../../../transport/response/ResponseHelper.js';
import { createCouponSchema, updateCouponSchema } from '../dto/coupon.dto.js';
/** Admin coupon lifecycle endpoints. */
export async function registerAdminCouponRoutes(app: FastifyInstance): Promise<void> {
  app.post('/', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => { const body = createCouponSchema.parse(request.body); const uc = app.diContainer.resolve<CreateCouponUseCase>('createCouponUseCase'); return reply.status(201).send(ResponseHelper.created(await uc.execute({ ...body, validFrom: new Date(body.validFrom), validUntil: new Date(body.validUntil) }), 'Coupon created successfully')); });
  app.patch('/:publicId', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => { const { publicId } = request.params as { publicId: string }; const body = updateCouponSchema.parse(request.body); const uc = app.diContainer.resolve<UpdateCouponUseCase>('updateCouponUseCase'); return reply.send(ResponseHelper.success(await uc.execute({ publicId, ...body, validFrom: body.validFrom ? new Date(body.validFrom) : undefined, validUntil: body.validUntil ? new Date(body.validUntil) : undefined }), 'Coupon updated successfully')); });
  app.delete('/:publicId', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => { const { publicId } = request.params as { publicId: string }; const uc = app.diContainer.resolve<ArchiveCouponUseCase>('archiveCouponUseCase'); await uc.execute(publicId); return reply.send(ResponseHelper.success(null, 'Coupon archived successfully')); });
}
