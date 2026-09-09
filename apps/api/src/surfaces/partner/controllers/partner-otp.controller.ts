import type { FastifyReply, FastifyRequest } from 'fastify';
import { ResponseHelper } from '../../../transport/response/ResponseHelper.js';
import { createPartnerOtpScreen } from '../screens/partner-otp.screen.js';

/** Public Partner presentation adapter that returns the validated OTP SDUI document only. */
export class PartnerOtpController {
  public get = async (request: FastifyRequest, reply: FastifyReply) =>
    reply.status(200).send(
      ResponseHelper.success(createPartnerOtpScreen(), 'Partner OTP screen fetched successfully.', request.traceId),
    );
}
