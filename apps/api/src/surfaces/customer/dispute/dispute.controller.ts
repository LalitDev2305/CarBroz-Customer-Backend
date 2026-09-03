import { ResponseHelper } from '../../../transport/response/ResponseHelper.js';
import { type FastifyInstance, type FastifyReply, type FastifyRequest } from 'fastify';
import { raiseDisputeSchema } from './dto/dispute.dto.js';
import { GetDisputeUseCase, RaiseDisputeUseCase } from '@carbroz/domain-dispute';

export async function disputeRoutes(fastify: FastifyInstance) {
  fastify.post(
    '/disputes',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = raiseDisputeSchema.parse(request.body);
      const user = request.user as any;
      const useCase = fastify.diContainer.resolve('raiseDisputeUseCase') as RaiseDisputeUseCase;
      const dispute = await useCase.execute({
        bookingPublicId: body.bookingPublicId,
        actorId: Number(user.id),
        actorType: 'CUSTOMER',
        disputeReason: body.disputeReason,
        description: body.description,
        requestedRefundPaise: body.requestedRefundPaise,
      });
      return reply.status(201).send(ResponseHelper.created(dispute, 'Dispute raised successfully'));
    },
  );

  fastify.get(
    '/disputes/:publicId',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { publicId } = request.params as { publicId: string };
      const useCase = fastify.diContainer.resolve('getDisputeUseCase') as GetDisputeUseCase;
      const dispute = await useCase.execute(publicId);
      return reply.status(200).send(ResponseHelper.success(dispute));
    },
  );
}
