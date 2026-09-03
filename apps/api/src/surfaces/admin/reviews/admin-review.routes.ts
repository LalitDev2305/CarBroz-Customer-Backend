import { type FastifyInstance, type FastifyReply, type FastifyRequest } from 'fastify';
import { ModerateReviewUseCase } from '@carbroz/domain-engagement';
import { ResponseHelper } from '../../../transport/response/ResponseHelper.js';
import { adminModerateReviewSchema } from './admin-review.dto.js';

export async function adminReviewRoutes(fastify: FastifyInstance) {
  fastify.patch(
    '/:reviewPublicId/moderate',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { reviewPublicId } = request.params as { reviewPublicId: string };
      const body = adminModerateReviewSchema.parse(request.body);
      const useCase = fastify.diContainer.resolve('moderateReviewUseCase') as ModerateReviewUseCase;
      const review = await useCase.execute({ reviewPublicId, ...body });
      return reply.send(ResponseHelper.success(review, 'Review moderated successfully'));
    },
  );
}
