import { productionSduiService } from '@carbroz/sdui-engine';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { ResponseHelper } from '../../../transport/response/ResponseHelper.js';

/** Public Partner presentation adapter that returns the engine-owned Login SDUI document only. */
export class PartnerLoginController {
  public get = async (request: FastifyRequest, reply: FastifyReply) =>
    reply.status(200).send(
      ResponseHelper.success(
        productionSduiService.buildScreen({ targetApp: 'PARTNER', screenId: 'partner_login' }),
        'Partner login screen fetched successfully.',
        request.traceId,
      ),
    );
}
