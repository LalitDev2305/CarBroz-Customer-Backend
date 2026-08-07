import { FastifyInstance } from 'fastify';
import { ScreenFactory } from '@carbroz/ui-sdk';
import { UIController } from './controller/UIController.js';
import { AuthLoginBuilder } from '../modules/auth/ui/AuthLoginBuilder.js';
import { AuthOtpBuilder } from '../modules/auth/ui/AuthOtpBuilder.js';
import { DashboardBuilder } from '../modules/config/ui/DashboardBuilder.js';

export default async function uiRoutes(fastify: FastifyInstance) {
  const factory = new ScreenFactory();
  factory.registerBuilders([
    new AuthLoginBuilder(),
    new AuthOtpBuilder(),
    new DashboardBuilder(),
  ]);

  const uiController = new UIController(factory);

  fastify.get('/*', async (request, reply) => {
    const screenPath = (request.params as any)['*'];
    console.log(`[UI Routes] Wildcard route hit. screenPath: "${screenPath}"`);
    
    const screenId = screenPath ? screenPath.split('/').pop() : '';
    console.log(`[UI Routes] Resolved screenId: "${screenId}"`);
    request.params = { screenId } as any;
    return uiController.getScreen(request as any, reply);
  });
}
