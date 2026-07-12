import { FastifyReply, FastifyRequest } from 'fastify';
import { getPrismaClient } from '@carbroz/database';
import { ResponseHelper } from '@carbroz/common';

export class AuthController {
  public async sendOtp(request: FastifyRequest, reply: FastifyReply) {
    const { phoneNumber, deviceId } = request.body as { phoneNumber: string, deviceId?: string };
    
    if (!phoneNumber) {
      return reply.status(400).send(ResponseHelper.error('Phone number is required'));
    }

    const prisma = getPrismaClient();
    const user = await prisma.user.findUnique({
      where: { phoneNumber }
    });
    const isNewUser = !user;

    // Use testing OTP for now
    const mockOtp = '123456';
    request.log.info(`Mock OTP generated for ${phoneNumber}: ${mockOtp}. DeviceId: ${deviceId}`);
    
    return reply.send(ResponseHelper.success({
      message: 'OTP sent successfully',
      mockOtp: mockOtp,
      isNewUser,
      nextScreen: {
        template: 'form_template',
        api: 'auth/auth_otp'
      }
    }));
  }

  public async verifyOtp(request: FastifyRequest, reply: FastifyReply) {
    const { 
      phoneNumber, 
      otp, 
      deviceId, 
      deviceModel, 
      osVersion, 
      fcmToken 
    } = request.body as { 
      phoneNumber: string; 
      otp: string; 
      deviceId: string; 
      deviceModel?: string; 
      osVersion?: string; 
      fcmToken?: string; 
    };

    if (!phoneNumber || !otp || !deviceId) {
      return reply.status(400).send(ResponseHelper.error('phoneNumber, otp, and deviceId are required'));
    }

    if (otp !== '123456' && otp !== '111111') {
      return reply.status(400).send(ResponseHelper.error('Invalid OTP'));
    }

    const prisma = getPrismaClient();
    
    // Upsert User
    const user = await prisma.user.upsert({
      where: { phoneNumber },
      update: {},
      create: { phoneNumber, role: 'USER' }
    });

    // Create or Update Device Session
    const session = await prisma.userSession.upsert({
      where: {
        userId_deviceId: {
          userId: user.id,
          deviceId: deviceId,
        }
      },
      update: {
        deviceModel,
        osVersion,
        fcmToken,
        lastActiveAt: new Date(),
        isRevoked: false
      },
      create: {
        userId: user.id,
        deviceId,
        deviceModel,
        osVersion,
        fcmToken,
      }
    });

    // Generate JWT (Stateless - 1 hour expiry typically, but keeping it simple)
    const token = await reply.jwtSign({
      id: user.id,
      sessionId: session.id,
      phoneNumber: user.phoneNumber,
      roles: [user.role]
    } as any, { expiresIn: '1h' });

    // Generate Refresh Token (Mocking an opaque token)
    const refreshToken = `rt_${Buffer.from(user.id + Date.now()).toString('base64')}`;
    
    await prisma.userSession.update({
      where: { id: session.id },
      data: { refreshToken }
    });

    return reply.send(ResponseHelper.success({
      user,
      token,
      refreshToken,
      message: 'Login successful',
      nextScreen: {
        template: 'dashboard_template',
        api: 'home'
      }
    }));
  }

  public async refresh(request: FastifyRequest, reply: FastifyReply) {
    const { refreshToken, deviceId } = request.body as { refreshToken: string; deviceId: string };
    
    if (!refreshToken || !deviceId) {
      return reply.status(400).send(ResponseHelper.error('refreshToken and deviceId are required'));
    }

    const prisma = getPrismaClient();
    
    const session = await prisma.userSession.findFirst({
      where: { refreshToken, deviceId, isRevoked: false },
      include: { user: true }
    });

    if (!session) {
      return reply.status(401).send(ResponseHelper.error('Invalid or expired refresh token'));
    }

    // Generate new JWT
    const token = await reply.jwtSign({
      id: session.user.id,
      sessionId: session.id,
      phoneNumber: session.user.phoneNumber,
      roles: [session.user.role]
    } as any, { expiresIn: '1h' });

    // Rotate refresh token
    const newRefreshToken = `rt_${Buffer.from(session.user.id + Date.now()).toString('base64')}`;
    
    await prisma.userSession.update({
      where: { id: session.id },
      data: { refreshToken: newRefreshToken, lastActiveAt: new Date() }
    });

    return reply.send(ResponseHelper.success({
      token,
      refreshToken: newRefreshToken,
      message: 'Token refreshed'
    }));
  }

  public async logout(request: FastifyRequest, reply: FastifyReply) {
    const { deviceId } = request.body as { deviceId?: string };
    if (request.user && (request.user as any).sessionId) {
      const prisma = getPrismaClient();
      await prisma.userSession.update({
        where: { id: (request.user as any).sessionId },
        data: { isRevoked: true, refreshToken: null }
      });
    }
    return reply.send(ResponseHelper.success({ message: 'Logged out successfully' }));
  }

  public async logoutAll(request: FastifyRequest, reply: FastifyReply) {
    if (request.user) {
      const prisma = getPrismaClient();
      await prisma.userSession.updateMany({
        where: { userId: request.user.id },
        data: { isRevoked: true, refreshToken: null }
      });
    }
    return reply.send(ResponseHelper.success({ message: 'Logged out of all devices' }));
  }

  public async me(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) {
      return reply.status(401).send(ResponseHelper.error('Unauthorized'));
    }
    
    const prisma = getPrismaClient();
    const user = await prisma.user.findUnique({
      where: { id: request.user.id }
    });

    if (!user) {
      return reply.status(404).send(ResponseHelper.error('User not found'));
    }

    return reply.send(ResponseHelper.success({ user }));
  }
}
