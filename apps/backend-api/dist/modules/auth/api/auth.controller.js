import { getPrismaClient } from '@carbroz/database';
import { ResponseHelper } from '@carbroz/common';
export class AuthController {
    async sendOtp(request, reply) {
        const { phoneNumber, deviceId } = request.body;
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
    async verifyOtp(request, reply) {
        const { phoneNumber, otp, deviceId, deviceModel, osVersion, fcmToken } = request.body;
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
        }, { expiresIn: '1h' });
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
    async refresh(request, reply) {
        const { refreshToken, deviceId } = request.body;
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
        }, { expiresIn: '1h' });
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
    async logout(request, reply) {
        const { deviceId } = request.body;
        if (request.user && request.user.sessionId) {
            const prisma = getPrismaClient();
            await prisma.userSession.update({
                where: { id: request.user.sessionId },
                data: { isRevoked: true, refreshToken: null }
            });
        }
        return reply.send(ResponseHelper.success({ message: 'Logged out successfully' }));
    }
    async logoutAll(request, reply) {
        if (request.user) {
            const prisma = getPrismaClient();
            await prisma.userSession.updateMany({
                where: { userId: request.user.id },
                data: { isRevoked: true, refreshToken: null }
            });
        }
        return reply.send(ResponseHelper.success({ message: 'Logged out of all devices' }));
    }
    async me(request, reply) {
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
//# sourceMappingURL=auth.controller.js.map