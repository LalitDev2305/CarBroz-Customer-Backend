import { FastifyReply, FastifyRequest } from 'fastify';
import { ScreenFactory } from '../factory/ScreenFactory.js';
import { JsonSerializer } from '../serializer/JsonSerializer.js';

export class UIController {
  private factory: ScreenFactory;

  constructor(factory: ScreenFactory) {
    this.factory = factory;
  }

  public getScreen = async (request: FastifyRequest<{ Params: { screenId: string } }>, reply: FastifyReply) => {
    try {
      const { screenId } = request.params;
      console.log(`[UI Controller] Attempting to fetch screenId: "${screenId}"`);

      // Auth check via JWT
      const isLoggedIn = !!request.user;
      const context = { isLoggedIn };

      const screen = await this.factory.buildScreen(screenId, context);
      const json = JsonSerializer.serialize(screen);
      return reply.send(json);
    } catch (error: any) {
      request.log.error(error);
      console.error(`[UI Controller Error]`, error);
      if (error.message.includes('not found')) {
        return reply.status(404).send({ message: error.message });
      }
      return reply.status(500).send({ message: 'Internal Server Error' });
    }
  };
}
