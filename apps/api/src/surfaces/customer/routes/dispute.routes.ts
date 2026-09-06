import type { FastifyInstance } from 'fastify';
import { RaiseDisputeUseCase } from '@carbroz/domain-dispute';
import { ResponseHelper } from '../../../transport/response/ResponseHelper.js';
import { raiseDisputeSchema } from '../dto/dispute.dto.js';

/** Customer-owned dispute creation endpoint. */
export async function registerCustomerDisputeRoutes(app: FastifyInstance): Promise<void> {
  app.post('/', { preHandler: [app.authenticate] }, async (request, reply) => {
    const input = raiseDisputeSchema.parse(request.body);
    const user = request.user as { id: string | number; roles?: string[]; role?: string };
    const roles = user.roles ?? (user.role ? [user.role] : []);
    const actorType: 'CUSTOMER' | 'PARTNER' = roles.includes('PARTNER') ? 'PARTNER' : 'CUSTOMER';
    const uc = app.diContainer.resolve<RaiseDisputeUseCase>('raiseDisputeUseCase');
    const dispute = await uc.execute({
      bookingPublicId: input.bookingPublicId,
      actorId: Number(user.id),
      actorType,
      disputeReason: input.disputeReason,
      description: input.description,
      requestedRefundPaise: input.requestedRefundPaise,
    });
    return reply.status(201).send(ResponseHelper.created(dispute, 'Dispute raised successfully'));
  });
}
