import { ResponseHelper } from '../response/ResponseHelper.js';
import { FastifyReply, FastifyRequest } from 'fastify';

import { SendOtpSchema, VerifyOtpSchema, GuestLoginSchema, RefreshTokenSchema, LogoutSchema } from '../dtos/auth.dto.js';
import { SendOtpUseCase } from '@carbroz/domain-identity';
import { VerifyOtpUseCase } from '@carbroz/domain-identity';
import { GuestLoginUseCase } from '@carbroz/domain-identity';
import { RefreshTokenUseCase } from '@carbroz/domain-identity';
import { LogoutUseCase } from '@carbroz/domain-identity';

export class AuthController {
  
  public async guestLogin(request: FastifyRequest, reply: FastifyReply) {
    const input = GuestLoginSchema.parse(request.body);
    const guestLoginUseCase = request.diScope.resolve<GuestLoginUseCase>('guestLoginUseCase');
    
    const result = await guestLoginUseCase.execute(input);

    const token = await reply.jwtSign({
      id: result.user.id,
      sessionId: result.session.id,
      isGuest: true,
      roles: [result.user.role]
    } as any, { expiresIn: '1h' });

    return reply.send(ResponseHelper.success({
      user: result.user,
      token,
      message: 'Guest session created',
    }));
  }

  public async sendOtp(request: FastifyRequest, reply: FastifyReply) {
    const input = SendOtpSchema.parse(request.body);
    const sendOtpUseCase = request.diScope.resolve<SendOtpUseCase>('sendOtpUseCase');
    
    const result = await sendOtpUseCase.execute(input);

    request.log.info(`Mock OTP generated for ${input.phoneNumber}: ${result.mockOtp}. DeviceId: ${input.deviceId}`);
    
    return reply.send(ResponseHelper.success(result));
  }

  public async verifyOtp(request: FastifyRequest, reply: FastifyReply) {
    const input = VerifyOtpSchema.parse(request.body);
    const verifyOtpUseCase = request.diScope.resolve<VerifyOtpUseCase>('verifyOtpUseCase');
    
    const result = await verifyOtpUseCase.execute(input);

    const token = await reply.jwtSign({
      id: result.user.id,
      sessionId: result.session.id,
      phoneNumber: result.user.phoneNumber,
      isGuest: false,
      roles: [result.user.role]
    } as any, { expiresIn: '1h' });

    return reply.send(ResponseHelper.success({
      user: result.user,
      token,
      refreshToken: result.session.refreshToken,
      message: 'Login successful',
      nextScreen: result.nextScreen
    }));
  }

  public async refresh(request: FastifyRequest, reply: FastifyReply) {
    const input = RefreshTokenSchema.parse(request.body);
    const refreshTokenUseCase = request.diScope.resolve<RefreshTokenUseCase>('refreshTokenUseCase');
    
    const result = await refreshTokenUseCase.execute(input);

    const token = await reply.jwtSign({
      id: result.user.id,
      sessionId: result.session.id,
      phoneNumber: result.user.phoneNumber,
      isGuest: result.user.isGuest,
      roles: [result.user.role]
    } as any, { expiresIn: '1h' });

    return reply.send(ResponseHelper.success({
      token,
      refreshToken: result.session.refreshToken,
      message: 'Token refreshed'
    }));
  }

  public async logout(request: FastifyRequest, reply: FastifyReply) {
    const input = LogoutSchema.parse(request.body);
    const logoutUseCase = request.diScope.resolve<LogoutUseCase>('logoutUseCase');
    
    const sessionId = request.user ? (request.user as any).sessionId : undefined;
    
    await logoutUseCase.execute({ ...input, sessionId });

    return reply.send(ResponseHelper.success({ message: 'Logged out successfully' }));
  }

  public async logoutAll(request: FastifyRequest, reply: FastifyReply) {
    const logoutUseCase = request.diScope.resolve<LogoutUseCase>('logoutUseCase');
    
    const userId = request.user ? (request.user as any).id : undefined;
    
    if (userId) {
      await logoutUseCase.execute({ logoutAll: true, userId });
    }

    return reply.send(ResponseHelper.success({ message: 'Logged out of all devices' }));
  }

  public async me(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) {
      return reply.status(401).send(ResponseHelper.error('Unauthorized'));
    }
    
    const userRepository = request.diScope.resolve<import('@carbroz/domain-identity').IUserRepository>('userRepository');
    const user = await userRepository.findById((request.user as any).id);

    if (!user) {
      return reply.status(404).send(ResponseHelper.error('User not found'));
    }

    return reply.send(ResponseHelper.success({ user }));
  }
}
