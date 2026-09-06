import type { FastifyInstance } from 'fastify';
import { DisputeStatus, ListDisputesUseCase, ResolveDisputeUseCase } from '@carbroz/domain-dispute';
import { ResponseHelper } from '../../../transport/response/ResponseHelper.js';
import { resolveDisputeSchema } from '../dto/dispute.dto.js';

/** Admin-only global dispute listing and resolution endpoints. */
export async function registerAdminDisputeRoutes(app: FastifyInstance): Promise<void> {
  app.get('/', { preHandler: [app.authenticate] }, async (request, reply) => {
    const query = request.query as { status?: string; limit?: string; offset?: string };
    const status = query.status ? query.status as DisputeStatus : undefined;
    const uc = app.diContainer.resolve<ListDisputesUseCase>('listDisputesUseCase');
    const disputes = await uc.execute(status, query.limit ? Number.parseInt(query.limit, 10) : 50, query.offset ? Number.parseInt(query.offset, 10) : 0);
    return reply.send(ResponseHelper.success(disputes, 'Disputes retrieved successfully'));
  });

  app.post('/:publicId/resolve', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { publicId } = request.params as { publicId: string };
    const input = resolveDisputeSchema.parse(request.body);
    const user = request.user as { id: string | number };
    const uc = app.diContainer.resolve<ResolveDisputeUseCase>('resolveDisputeUseCase');
    const dispute = await uc.execute({
      disputePublicId: publicId,
      adminId: Number(user.id),
      action: input.action,
      approvedRefundPaise: input.approvedRefundPaise,
      resolutionNotes: input.resolutionNotes,
    });
    return reply.send(ResponseHelper.success(dispute, 'Dispute resolved successfully'));
  });
}
