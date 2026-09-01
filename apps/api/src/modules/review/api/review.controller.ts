import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ResponseHelper } from '@carbroz/common';
import { SubmitReviewUseCase } from '../use-cases/SubmitReviewUseCase.js';
import { ModerateReviewUseCase } from '../use-cases/ModerateReviewUseCase.js';
import { GetPartnerReviewsUseCase } from '../use-cases/GetPartnerReviewsUseCase.js';
import { moderateReviewSchema, submitReviewSchema } from '../dtos/review.dto.js';

export async function reviewRoutes(fastify: FastifyInstance) {
  fastify.post(
    '/api/v1/reviews',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = submitReviewSchema.parse(request.body);
      const useCase: SubmitReviewUseCase = fastify.diContainer.resolve('submitReviewUseCase');

      const review = await useCase.execute({
        ...body,
        customerUserId: (request.user as any).id,
      });

      return reply.status(201).send(ResponseHelper.created(review, 'Review submitted successfully'));
    }
  );

  fastify.get(
    '/api/v1/partners/:partnerPublicId/reviews',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { partnerPublicId } = request.params as { partnerPublicId: string };
      const { limit, offset } = request.query as { limit?: string; offset?: string };
      const useCase: GetPartnerReviewsUseCase = fastify.diContainer.resolve('getPartnerReviewsUseCase');

      const reviews = await useCase.execute({
        partnerPublicId,
        limit: limit ? parseInt(limit, 10) : 50,
        offset: offset ? parseInt(offset, 10) : 0,
      });

      return reply.send(ResponseHelper.success(reviews, 'Partner reviews retrieved successfully'));
    }
  );

  fastify.patch(
    '/api/v1/admin/reviews/:reviewPublicId/moderate',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { reviewPublicId } = request.params as { reviewPublicId: string };
      const body = moderateReviewSchema.parse({ ...(request.body as any), reviewPublicId });
      const useCase: ModerateReviewUseCase = fastify.diContainer.resolve('moderateReviewUseCase');

      const review = await useCase.execute(body);

      return reply.send(ResponseHelper.success(review, 'Review moderated successfully'));
    }
  );
}
