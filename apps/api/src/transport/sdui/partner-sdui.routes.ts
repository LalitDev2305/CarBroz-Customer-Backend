import type { FastifyInstance } from 'fastify';
import type { GetSduiScreenUseCase } from '@carbroz/sdui-registry';
import { ResponseHelper } from '../response/ResponseHelper.js';

/** Exposes authenticated SDUI runtime retrieval for PARTNER scope only. */
export async function registerPartnerSduiRoutes(app: FastifyInstance): Promise<void> {
  app.get('/registry/:screenId', async (request, reply) => {
    await request.jwtVerify();

    const { screenId } = request.params as { screenId: string };
    const useCase = request.diScope.resolve<GetSduiScreenUseCase>('getSduiScreenUseCase');
    const screen = await useCase.execute({
      data: {
        screenId,
        targetApp: 'PARTNER',
      },
    });

    return reply.send(ResponseHelper.success(screen));
  });
}
