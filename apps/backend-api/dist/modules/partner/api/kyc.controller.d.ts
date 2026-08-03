import { FastifyRequest, FastifyReply } from 'fastify';
export declare class KycController {
    upload(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    getStatus(request: FastifyRequest<{
        Params: {
            partnerId: string;
        };
    }>, reply: FastifyReply): Promise<never>;
}
