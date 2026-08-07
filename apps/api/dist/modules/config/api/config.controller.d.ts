import { FastifyReply, FastifyRequest } from 'fastify';
import { GetInitConfigUseCase } from '../use-cases/GetInitConfigUseCase.js';
export declare class ConfigController {
    private getInitConfigUseCase;
    constructor(getInitConfigUseCase: GetInitConfigUseCase);
    getInitConfig(request: FastifyRequest, reply: FastifyReply): Promise<never>;
}
