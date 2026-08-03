import { FastifyReply, FastifyRequest } from 'fastify';
import { RegisterSduiComponentUseCase } from '../../sdui/use-cases/RegisterSduiComponentUseCase.js';
import { UpdateSduiScreenLayoutUseCase } from '../../sdui/use-cases/UpdateSduiScreenLayoutUseCase.js';
export declare class AdminSduiController {
    private readonly registerSduiComponentUseCase;
    private readonly updateSduiScreenLayoutUseCase;
    constructor(registerSduiComponentUseCase: RegisterSduiComponentUseCase, updateSduiScreenLayoutUseCase: UpdateSduiScreenLayoutUseCase);
    registerComponent: (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
    updateScreenLayout: (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
}
