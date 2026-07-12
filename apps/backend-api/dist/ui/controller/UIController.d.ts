import { FastifyReply, FastifyRequest } from 'fastify';
import { ScreenFactory } from '../factory/ScreenFactory.js';
export declare class UIController {
    private factory;
    constructor(factory: ScreenFactory);
    getScreen: (request: FastifyRequest<{
        Params: {
            screenId: string;
        };
    }>, reply: FastifyReply) => Promise<never>;
}
