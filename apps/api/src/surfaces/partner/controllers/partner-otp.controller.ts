import { productionSduiService } from '@carbroz/sdui-engine';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { ResponseHelper } from '../../../transport/response/ResponseHelper.js';

/** Public Partner presentation adapter that returns the engine-owned OTP SDUI document only. */
export class PartnerOtpController {
  public get = async (request: FastifyRequest, reply: FastifyReply) =>
    reply.status(200).send(
      ResponseHelper.success(
        productionSduiService.buildScreen({ targetApp: 'PARTNER', screenId: 'partner_otp' }),
        'Partner OTP screen fetched successfully.',
        request.traceId,
      ),
    );
}
