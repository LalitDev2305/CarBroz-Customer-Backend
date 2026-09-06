import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ModerateReviewUseCase } from '@carbroz/domain-engagement';
import { ResponseHelper } from '../../../transport/response/ResponseHelper.js';
import { moderateReviewSchema } from '../dto/review.dto.js';
/** Admin review moderation endpoints. */
export async function registerAdminReviewRoutes(app: FastifyInstance): Promise<void> {
  app.patch('/:reviewPublicId/moderate', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { reviewPublicId } = request.params as { reviewPublicId: string };
    const body = moderateReviewSchema.parse({ ...(request.body as object), reviewPublicId });
    const useCase = app.diContainer.resolve<ModerateReviewUseCase>('moderateReviewUseCase');
    return reply.send(ResponseHelper.success(await useCase.execute(body), 'Review moderated successfully'));
  });
}
