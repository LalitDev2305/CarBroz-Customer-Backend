import type { FastifyReply, FastifyRequest } from 'fastify';
import { ResponseHelper } from '../../../transport/response/ResponseHelper.js';
import { createPartnerLoginScreen } from '../screens/partner-login.screen.js';

/** Public Partner presentation adapter that returns the validated Login SDUI document only. */
export class PartnerLoginController {
  public get = async (request: FastifyRequest, reply: FastifyReply) =>
    reply.status(200).send(
      ResponseHelper.success(createPartnerLoginScreen(), 'Partner login screen fetched successfully.', request.traceId),
    );
}
