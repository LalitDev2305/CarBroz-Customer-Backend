import { FastifyReply, FastifyRequest } from 'fastify';
import { ScreenFactory } from '@carbroz/sdui-engine';
export declare class UIController {
    private factory;
    constructor(factory: ScreenFactory);
    getScreen: (request: FastifyRequest<{
        Params: {
            screenId: string;
        };
    }>, reply: FastifyReply) => Promise<never>;
}
