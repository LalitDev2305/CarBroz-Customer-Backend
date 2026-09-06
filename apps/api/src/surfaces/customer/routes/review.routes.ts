import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { SubmitReviewUseCase, GetPartnerReviewsUseCase } from '@carbroz/domain-engagement';
import { ResponseHelper } from '../../../transport/response/ResponseHelper.js';
import { submitReviewSchema } from '../dto/review.dto.js';
/** Customer review endpoints. */
export async function registerCustomerReviewRoutes(app: FastifyInstance): Promise<void> {
  app.post('/', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const body = submitReviewSchema.parse(request.body);
    const useCase = app.diContainer.resolve<SubmitReviewUseCase>('submitReviewUseCase');
    const review = await useCase.execute({ ...body, customerUserId: Number(request.user.id) });
    return reply.status(201).send(ResponseHelper.created(review, 'Review submitted successfully'));
  });
  app.get('/partner/:partnerPublicId', async (request: FastifyRequest, reply: FastifyReply) => {
    const { partnerPublicId } = request.params as { partnerPublicId: string };
    const { limit, offset } = request.query as { limit?: string; offset?: string };
    const useCase = app.diContainer.resolve<GetPartnerReviewsUseCase>('getPartnerReviewsUseCase');
    const reviews = await useCase.execute({ partnerPublicId, limit: limit ? Number(limit) : 50, offset: offset ? Number(offset) : 0 });
    return reply.send(ResponseHelper.success(reviews, 'Partner reviews retrieved successfully'));
  });
}
