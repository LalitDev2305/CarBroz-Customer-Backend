import { UploadKycDocumentSchema } from '../dtos/kyc.dto.js';
import { diContainer } from '@fastify/awilix';
export class KycController {
    async upload(request, reply) {
        // Requires @fastify/multipart plugin registered in app.ts
        const data = await request.file();
        if (!data) {
            return reply.status(400).send({ message: 'File is required' });
        }
        const partnerIdStr = data.fields.partnerId?.value;
        const typeStr = data.fields.type?.value;
        if (!partnerIdStr || !typeStr) {
            return reply.status(400).send({ message: 'partnerId and type are required fields' });
        }
        const partnerId = parseInt(partnerIdStr, 10);
        const typeParseResult = UploadKycDocumentSchema.safeParse({ type: typeStr });
        if (!typeParseResult.success) {
            return reply.status(400).send({ message: 'Invalid document type', errors: typeParseResult.error.errors });
        }
        const fileBuffer = await data.toBuffer();
        const context = {
            traceId: request.traceId,
            authenticatedUser: request.user
        };
        try {
            const uploadKycDocumentUseCase = diContainer.resolve('uploadKycDocumentUseCase');
            await uploadKycDocumentUseCase.execute({
                context,
                data: {
                    partnerId,
                    type: typeParseResult.data.type,
                    fileBuffer,
                    mimeType: data.mimetype,
                }
            });
            return reply.status(201).send({ message: 'Document uploaded successfully' });
        }
        catch (error) {
            const status = error.message.startsWith('FORBIDDEN') ? 403 : 400;
            return reply.status(status).send({ message: error.message });
        }
    }
    async getStatus(request, reply) {
        const partnerId = parseInt(request.params.partnerId, 10);
        if (isNaN(partnerId)) {
            return reply.status(400).send({ message: 'Invalid partnerId' });
        }
        const context = {
            traceId: request.traceId,
            authenticatedUser: request.user
        };
        try {
            const getPartnerKycStatusUseCase = diContainer.resolve('getPartnerKycStatusUseCase');
            const documents = await getPartnerKycStatusUseCase.execute({
                context,
                data: { partnerId }
            });
            return reply.send({ documents });
        }
        catch (error) {
            const status = error.message.startsWith('FORBIDDEN') ? 403 : 400;
            return reply.status(status).send({ message: error.message });
        }
    }
}
//# sourceMappingURL=kyc.controller.js.map