import { toExecutionContext } from '../../../bootstrap/lifecycle/toExecutionContext.js';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { UploadKycDocumentUseCase } from '@carbroz/domain-partner';
import { GetPartnerKycStatusUseCase } from '@carbroz/domain-partner';
import { UploadKycDocumentSchema } from '../dto/partner.kyc.dto.js';
import { diContainer } from '@fastify/awilix';

/** KycController is an exported apps/api contract/implementation; see the owning README for lifecycle and extension rules. */
export class KycController {
  async upload(request: FastifyRequest, reply: FastifyReply) {
    const data = await request.file();

    if (!data) {
      return reply.status(400).send({ message: 'File is required' });
    }

    const partnerPublicId = String(
      (data.fields.partnerPublicId as any)?.value ?? '',
    ).trim();
    const typeStr = (data.fields.type as any)?.value;

    if (!partnerPublicId || !typeStr) {
      return reply.status(400).send({
        message: 'partnerPublicId and type are required fields',
      });
    }

    const typeParseResult = UploadKycDocumentSchema.safeParse({ type: typeStr });

    if (!typeParseResult.success) {
      return reply.status(400).send({
        message: 'Invalid document type',
        errors: (typeParseResult.error as any).errors,
      });
    }

    const fileBuffer = await data.toBuffer();
    const context = toExecutionContext(request);

    try {
      const uploadKycDocumentUseCase =
        diContainer.resolve<UploadKycDocumentUseCase>('uploadKycDocumentUseCase');
      await uploadKycDocumentUseCase.execute({
        context,
        data: {
          partnerPublicId,
          type: typeParseResult.data.type,
          fileName: data.filename,
          fileBuffer,
          mimeType: data.mimetype,
        },
      });

      return reply.status(201).send({ message: 'Document uploaded successfully' });
    } catch (error: any) {
      const status = error.message.startsWith('FORBIDDEN')
        ? 403
        : error.message.startsWith('NOT_FOUND')
          ? 404
          : 400;
      return reply.status(status).send({ message: error.message });
    }
  }

  async getStatus(
    request: FastifyRequest<{ Params: { partnerPublicId: string } }>,
    reply: FastifyReply,
  ) {
    const partnerPublicId = request.params.partnerPublicId.trim();
    if (!partnerPublicId) {
      return reply.status(400).send({ message: 'Invalid partnerPublicId' });
    }

    const context = toExecutionContext(request);

    try {
      const getPartnerKycStatusUseCase =
        diContainer.resolve<GetPartnerKycStatusUseCase>('getPartnerKycStatusUseCase');
      const documents = await getPartnerKycStatusUseCase.execute({
        context,
        data: { partnerPublicId },
      });
      return reply.send({ documents });
    } catch (error: any) {
      const status = error.message.startsWith('FORBIDDEN')
        ? 403
        : error.message.startsWith('NOT_FOUND')
          ? 404
          : 400;
      return reply.status(status).send({ message: error.message });
    }
  }
}
