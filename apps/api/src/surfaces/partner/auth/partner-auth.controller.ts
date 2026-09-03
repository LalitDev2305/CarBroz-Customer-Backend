import { type FastifyReply, type FastifyRequest } from 'fastify';
import {
  GuestLoginUseCase,
  LogoutUseCase,
  RefreshTokenUseCase,
  SendOtpUseCase,
  VerifyOtpUseCase,
} from '@carbroz/domain-identity';
import { ResponseHelper } from '../../../transport/response/ResponseHelper.js';
import {
  PartnerGuestLoginSchema,
  PartnerLogoutSchema,
  PartnerRefreshTokenSchema,
  PartnerSendOtpSchema,
  PartnerVerifyOtpSchema,
} from './partner-auth.dto.js';

export class PartnerAuthController {
  async guestLogin(request: FastifyRequest, reply: FastifyReply) {
    const input = PartnerGuestLoginSchema.parse(request.body);
    const useCase = request.diScope.resolve<GuestLoginUseCase>('guestLoginUseCase');
    const result = await useCase.execute(input);
    const token = await reply.jwtSign({ id: result.user.id, sessionId: result.session.id, isGuest: true, roles: [result.user.role] } as any, { expiresIn: '1h' });
    return reply.send(ResponseHelper.success({ user: result.user, token }));
  }

  async sendOtp(request: FastifyRequest, reply: FastifyReply) {
    const input = PartnerSendOtpSchema.parse(request.body);
    const useCase = request.diScope.resolve<SendOtpUseCase>('sendOtpUseCase');
    const result = await useCase.execute(input);
    return reply.send(ResponseHelper.success(result));
  }

  async verifyOtp(request: FastifyRequest, reply: FastifyReply) {
    const input = PartnerVerifyOtpSchema.parse(request.body);
    const useCase = request.diScope.resolve<VerifyOtpUseCase>('verifyOtpUseCase');
    const result = await useCase.execute(input);
    const token = await reply.jwtSign({
      id: result.user.id,
      sessionId: result.session.id,
      phoneNumber: result.user.phoneNumber,
      isGuest: false,
      roles: [result.user.role],
    } as any, { expiresIn: '1h' });
    return reply.send(ResponseHelper.success({ user: result.user, token, refreshToken: result.session.refreshToken }));
  }

  async refresh(request: FastifyRequest, reply: FastifyReply) {
    const input = PartnerRefreshTokenSchema.parse(request.body);
    const useCase = request.diScope.resolve<RefreshTokenUseCase>('refreshTokenUseCase');
    const result = await useCase.execute(input);
    const token = await reply.jwtSign({
      id: result.user.id,
      sessionId: result.session.id,
      phoneNumber: result.user.phoneNumber,
      isGuest: result.user.isGuest,
      roles: [result.user.role],
    } as any, { expiresIn: '1h' });
    return reply.send(ResponseHelper.success({ token, refreshToken: result.session.refreshToken }));
  }

  async logout(request: FastifyRequest, reply: FastifyReply) {
    const input = PartnerLogoutSchema.parse(request.body);
    const useCase = request.diScope.resolve<LogoutUseCase>('logoutUseCase');
    const sessionId = request.user ? (request.user as any).sessionId : undefined;
    await useCase.execute({ ...input, ...(sessionId !== undefined ? { sessionId } : {}) });
    return reply.send(ResponseHelper.success({ message: 'Logged out successfully' }));
  }

  async logoutAll(request: FastifyRequest, reply: FastifyReply) {
    const useCase = request.diScope.resolve<LogoutUseCase>('logoutUseCase');
    const userId = request.user ? (request.user as any).id : undefined;
    if (userId !== undefined) await useCase.execute({ logoutAll: true, userId });
    return reply.send(ResponseHelper.success({ message: 'Logged out of all devices' }));
  }

  async me(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) return reply.status(401).send(ResponseHelper.error('Unauthorized'));
    const repository = request.diScope.resolve<import('@carbroz/domain-identity').IUserRepository>('userRepository');
    const user = await repository.findById((request.user as any).id);
    if (!user) return reply.status(404).send(ResponseHelper.error('User not found'));
    return reply.send(ResponseHelper.success({ user }));
  }
}
