import { type FastifyInstance, type FastifyReply, type FastifyRequest } from 'fastify';
import { GetPartnerReviewsUseCase, SubmitReviewUseCase } from '@carbroz/domain-engagement';
import { ResponseHelper } from '../../../transport/response/ResponseHelper.js';
import { submitReviewSchema } from './dto/review.dto.js';

export async function reviewRoutes(fastify: FastifyInstance) {
  fastify.post(
    '/reviews',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = submitReviewSchema.parse(request.body);
      const useCase = fastify.diContainer.resolve('submitReviewUseCase') as SubmitReviewUseCase;
      const review = await useCase.execute({ ...body, customerUserId: (request.user as any).id });
      return reply.status(201).send(ResponseHelper.created(review, 'Review submitted successfully'));
    },
  );

  fastify.get(
    '/partners/:partnerPublicId/reviews',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { partnerPublicId } = request.params as { partnerPublicId: string };
      const { limit, offset } = request.query as { limit?: string; offset?: string };
      const useCase = fastify.diContainer.resolve('getPartnerReviewsUseCase') as GetPartnerReviewsUseCase;
      const reviews = await useCase.execute({
        partnerPublicId,
        limit: limit ? parseInt(limit, 10) : 50,
        offset: offset ? parseInt(offset, 10) : 0,
      });
      return reply.send(ResponseHelper.success(reviews, 'Partner reviews retrieved successfully'));
    },
  );
}
