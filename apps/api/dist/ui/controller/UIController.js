import { JsonSerializer } from '@carbroz/sdui-engine';
export class UIController {
    factory;
    constructor(factory) {
        this.factory = factory;
    }
    getScreen = async (request, reply) => {
        try {
            const { screenId } = request.params;
            console.log(`[UI Controller] Attempting to fetch screenId: "${screenId}"`);
            // Auth check via JWT
            const isLoggedIn = !!request.user;
            const context = { isLoggedIn };
            const screen = await this.factory.buildScreen(screenId, context);
            const json = JsonSerializer.serialize(screen);
            return reply.send(json);
        }
        catch (error) {
            request.log.error(error);
            console.error(`[UI Controller Error]`, error);
            if (error.message.includes('not found')) {
                return reply.status(404).send({ message: error.message });
            }
            return reply.status(500).send({ message: 'Internal Server Error' });
        }
    };
}
//# sourceMappingURL=UIController.js.map