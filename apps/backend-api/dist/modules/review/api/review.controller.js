import { ResponseHelper } from '@carbroz/common';
import { moderateReviewSchema, submitReviewSchema } from '../dtos/review.dto.js';
export async function reviewRoutes(fastify) {
    fastify.post('/api/v1/reviews', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const body = submitReviewSchema.parse(request.body);
        const useCase = fastify.diContainer.resolve('submitReviewUseCase');
        const review = await useCase.execute({
            ...body,
            customerUserId: request.user.id,
        });
        return reply.status(201).send(ResponseHelper.created(review, 'Review submitted successfully'));
    });
    fastify.get('/api/v1/partners/:partnerPublicId/reviews', async (request, reply) => {
        const { partnerPublicId } = request.params;
        const { limit, offset } = request.query;
        const useCase = fastify.diContainer.resolve('getPartnerReviewsUseCase');
        const reviews = await useCase.execute({
            partnerPublicId,
            limit: limit ? parseInt(limit, 10) : 50,
            offset: offset ? parseInt(offset, 10) : 0,
        });
        return reply.send(ResponseHelper.success(reviews, 'Partner reviews retrieved successfully'));
    });
    fastify.patch('/api/v1/admin/reviews/:reviewPublicId/moderate', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const { reviewPublicId } = request.params;
        const body = moderateReviewSchema.parse({ ...request.body, reviewPublicId });
        const useCase = fastify.diContainer.resolve('moderateReviewUseCase');
        const review = await useCase.execute(body);
        return reply.send(ResponseHelper.success(review, 'Review moderated successfully'));
    });
}
//# sourceMappingURL=review.controller.js.map