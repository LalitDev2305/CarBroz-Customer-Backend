import { FastifyReply, FastifyRequest } from 'fastify';
import { GetSduiScreenUseCase } from '../use-cases/GetSduiScreenUseCase.js';
export declare class SduiRegistryController {
    private readonly getSduiScreenUseCase;
    constructor(getSduiScreenUseCase: GetSduiScreenUseCase);
    getScreen: (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
}
