import { FastifyRequest, FastifyReply } from 'fastify';
import { AdminReviewKycDocumentUseCase } from '../use-cases/AdminReviewKycDocumentUseCase.js';
import { ReviewKycDocumentSchema } from '../dtos/admin-kyc.dto.js';
import { IRequestContext, KycDocumentStatus } from '@carbroz/common';
import { diContainer } from '@fastify/awilix';

export class AdminKycController {
  async reviewDocument(request: FastifyRequest<{ Params: { documentId: string } }>, reply: FastifyReply) {
    const documentId = parseInt(request.params.documentId, 10);
    
    if (isNaN(documentId)) {
      return reply.status(400).send({ message: 'Invalid documentId' });
    }

    const parseResult = ReviewKycDocumentSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({ message: 'Validation failed', errors: (parseResult.error as any).errors });
    }

    const context = {
      traceId: request.traceId,
      authenticatedUser: request.user as any
    } as IRequestContext;

    try {
      const useCase = diContainer.resolve<AdminReviewKycDocumentUseCase>('adminReviewKycDocumentUseCase');
      const action = parseResult.data.status === KycDocumentStatus.APPROVED ? 'APPROVE' : 'REJECT';
      const document = await useCase.execute({
        context,
        data: {
          documentId: Number(request.params.documentId),
          action,
          reason: parseResult.data.rejectionReason,
        }
      });

      return reply.send({ message: 'Document reviewed successfully', document });
    } catch (error: any) {
      const status = error.message.startsWith('NOT_FOUND') ? 404 : 400;
      return reply.status(status).send({ message: error.message });
    }
  }
}
