import { FastifyRequest, FastifyReply } from 'fastify';
import { UploadKycDocumentUseCase } from '@carbroz/domain-partner';
import { GetPartnerKycStatusUseCase } from '@carbroz/domain-partner';
import { UploadKycDocumentSchema } from './dto/kyc.dto.js';
import { type IRequestContext } from '@carbroz/foundation-kernel';
import { diContainer } from '@fastify/awilix';

export class KycController {
  async upload(request: FastifyRequest, reply: FastifyReply) {
    // Requires @fastify/multipart plugin registered in app.ts
    const data = await request.file();
    
    if (!data) {
      return reply.status(400).send({ message: 'File is required' });
    }

    const partnerIdStr = (data.fields.partnerId as any)?.value;
    const typeStr = (data.fields.type as any)?.value;

    if (!partnerIdStr || !typeStr) {
      return reply.status(400).send({ message: 'partnerId and type are required fields' });
    }

    const partnerId = parseInt(partnerIdStr, 10);
    const typeParseResult = UploadKycDocumentSchema.safeParse({ type: typeStr });

    if (!typeParseResult.success) {
      return reply.status(400).send({ message: 'Invalid document type', errors: (typeParseResult.error as any).errors });
    }

    const fileBuffer = await data.toBuffer();

    const context = {
      traceId: request.traceId,
      authenticatedUser: request.user as any
    } as IRequestContext;

    try {
      const uploadKycDocumentUseCase = diContainer.resolve<UploadKycDocumentUseCase>('uploadKycDocumentUseCase');
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
    } catch (error: any) {
      const status = error.message.startsWith('FORBIDDEN') ? 403 : 400;
      return reply.status(status).send({ message: error.message });
    }
  }

  async getStatus(request: FastifyRequest<{ Params: { partnerId: string } }>, reply: FastifyReply) {
    const partnerId = parseInt(request.params.partnerId, 10);
    
    if (isNaN(partnerId)) {
      return reply.status(400).send({ message: 'Invalid partnerId' });
    }

    const context = {
      traceId: request.traceId,
      authenticatedUser: request.user as any
    } as IRequestContext;

    try {
      const getPartnerKycStatusUseCase = diContainer.resolve<GetPartnerKycStatusUseCase>('getPartnerKycStatusUseCase');
      const documents = await getPartnerKycStatusUseCase.execute({ 
        context,
        data: { partnerId }
      });
      return reply.send({ documents });
    } catch (error: any) {
      const status = error.message.startsWith('FORBIDDEN') ? 403 : 400;
      return reply.status(status).send({ message: error.message });
    }
  }
}
