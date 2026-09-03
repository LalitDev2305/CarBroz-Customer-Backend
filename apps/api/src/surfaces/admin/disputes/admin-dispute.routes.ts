import { ResponseHelper } from '../../../transport/response/ResponseHelper.js';
import { type FastifyInstance, type FastifyReply, type FastifyRequest } from 'fastify';
import { ListDisputesUseCase, ResolveDisputeUseCase } from '@carbroz/domain-dispute';
import { adminResolveDisputeSchema } from './admin-dispute.dto.js';

export async function adminDisputeRoutes(fastify: FastifyInstance) {
  fastify.get('/', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { status, limit, offset } = request.query as { status?: any; limit?: string; offset?: string };
    const useCase = fastify.diContainer.resolve('listDisputesUseCase') as ListDisputesUseCase;
    const disputes = await useCase.execute(status, limit ? parseInt(limit, 10) : 50, offset ? parseInt(offset, 10) : 0);
    return reply.status(200).send(ResponseHelper.success(disputes));
  });

  fastify.post('/:publicId/resolve', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { publicId } = request.params as { publicId: string };
    const body = adminResolveDisputeSchema.parse(request.body);
    const user = request.user as any;
    const useCase = fastify.diContainer.resolve('resolveDisputeUseCase') as ResolveDisputeUseCase;
    const dispute = await useCase.execute({
      disputePublicId: publicId,
      adminId: Number(user.id),
      action: body.action,
      approvedRefundPaise: body.approvedRefundPaise,
      resolutionNotes: body.resolutionNotes,
    });
    return reply.status(200).send(ResponseHelper.success(dispute, 'Dispute resolved successfully'));
  });
}
