import { ReviewKycDocumentSchema } from '../dtos/admin-kyc.dto.js';
import { KycDocumentStatus } from '@carbroz/foundation-kernel';
import { diContainer } from '@fastify/awilix';
export class AdminKycController {
    async reviewDocument(request, reply) {
        const documentId = parseInt(request.params.documentId, 10);
        if (isNaN(documentId)) {
            return reply.status(400).send({ message: 'Invalid documentId' });
        }
        const parseResult = ReviewKycDocumentSchema.safeParse(request.body);
        if (!parseResult.success) {
            return reply.status(400).send({ message: 'Validation failed', errors: parseResult.error.errors });
        }
        const context = {
            traceId: request.traceId,
            authenticatedUser: request.user
        };
        try {
            const useCase = diContainer.resolve('adminReviewKycDocumentUseCase');
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
        }
        catch (error) {
            const status = error.message.startsWith('NOT_FOUND') ? 404 : 400;
            return reply.status(status).send({ message: error.message });
        }
    }
}
//# sourceMappingURL=admin-kyc.controller.js.map