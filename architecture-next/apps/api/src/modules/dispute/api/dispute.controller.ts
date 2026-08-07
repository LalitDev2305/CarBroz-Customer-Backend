import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ResponseHelper } from '@carbroz/common';
import { raiseDisputeSchema, resolveDisputeSchema } from '../dtos/dispute.dto.js';
import { RaiseDisputeUseCase } from '../use-cases/RaiseDisputeUseCase.js';
import { ResolveDisputeUseCase } from '../use-cases/ResolveDisputeUseCase.js';
import { GetDisputeUseCase } from '../use-cases/GetDisputeUseCase.js';
import { ListDisputesUseCase } from '../use-cases/ListDisputesUseCase.js';

export async function disputeRoutes(fastify: FastifyInstance) {
  // POST /api/v1/disputes
  fastify.post(
    '/api/v1/disputes',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = raiseDisputeSchema.parse(request.body);
      const user = request.user as any;
      const actorType = user.role === 'PARTNER' ? 'PARTNER' : 'CUSTOMER';

      const useCase: RaiseDisputeUseCase = fastify.diContainer.resolve('raiseDisputeUseCase');
      const dispute = await useCase.execute({
        bookingPublicId: body.bookingPublicId,
        actorId: Number(user.id),
        actorType,
        disputeReason: body.disputeReason,
        description: body.description,
        requestedRefundPaise: body.requestedRefundPaise,
      });

      return reply.status(201).send(ResponseHelper.created(dispute, 'Dispute raised successfully'));
    }
  );

  // GET /api/v1/disputes/:publicId
  fastify.get(
    '/api/v1/disputes/:publicId',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { publicId } = request.params as { publicId: string };
      const useCase: GetDisputeUseCase = fastify.diContainer.resolve('getDisputeUseCase');
      const dispute = await useCase.execute(publicId);

      return reply.status(200).send(ResponseHelper.success(dispute));
    }
  );

  // GET /api/v1/admin/disputes
  fastify.get(
    '/api/v1/admin/disputes',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { status, limit, offset } = request.query as { status?: any; limit?: string; offset?: string };
      const useCase: ListDisputesUseCase = fastify.diContainer.resolve('listDisputesUseCase');

      const disputes = await useCase.execute(
        status,
        limit ? parseInt(limit, 10) : 50,
        offset ? parseInt(offset, 10) : 0
      );

      return reply.status(200).send(ResponseHelper.success(disputes));
    }
  );

  // POST /api/v1/admin/disputes/:publicId/resolve
  fastify.post(
    '/api/v1/admin/disputes/:publicId/resolve',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { publicId } = request.params as { publicId: string };
      const body = resolveDisputeSchema.parse(request.body);
      const user = request.user as any;

      const useCase: ResolveDisputeUseCase = fastify.diContainer.resolve('resolveDisputeUseCase');
      const dispute = await useCase.execute({
        disputePublicId: publicId,
        adminId: Number(user.id),
        action: body.action,
        approvedRefundPaise: body.approvedRefundPaise,
        resolutionNotes: body.resolutionNotes,
      });

      return reply.status(200).send(ResponseHelper.success(dispute, 'Dispute resolved successfully'));
    }
  );
}
