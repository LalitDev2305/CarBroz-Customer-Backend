import { FastifyRequest, FastifyReply } from 'fastify';
export declare class AdminKycController {
    reviewDocument(request: FastifyRequest<{
        Params: {
            documentId: string;
        };
    }>, reply: FastifyReply): Promise<never>;
}
