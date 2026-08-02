import { ResponseHelper } from '@carbroz/common';
import { SendOtpSchema, VerifyOtpSchema, GuestLoginSchema, RefreshTokenSchema, LogoutSchema } from '../dtos/auth.dto.js';
export class AuthController {
    async guestLogin(request, reply) {
        const input = GuestLoginSchema.parse(request.body);
        const guestLoginUseCase = request.diScope.resolve('guestLoginUseCase');
        const result = await guestLoginUseCase.execute(input);
        const token = await reply.jwtSign({
            id: result.user.id,
            sessionId: result.session.id,
            isGuest: true,
            roles: [result.user.role]
        }, { expiresIn: '1h' });
        return reply.send(ResponseHelper.success({
            user: result.user,
            token,
            message: 'Guest session created',
        }));
    }
    async sendOtp(request, reply) {
        const input = SendOtpSchema.parse(request.body);
        const sendOtpUseCase = request.diScope.resolve('sendOtpUseCase');
        const result = await sendOtpUseCase.execute(input);
        request.log.info(`Mock OTP generated for ${input.phoneNumber}: ${result.mockOtp}. DeviceId: ${input.deviceId}`);
        return reply.send(ResponseHelper.success(result));
    }
    async verifyOtp(request, reply) {
        const input = VerifyOtpSchema.parse(request.body);
        const verifyOtpUseCase = request.diScope.resolve('verifyOtpUseCase');
        const result = await verifyOtpUseCase.execute(input);
        const token = await reply.jwtSign({
            id: result.user.id,
            sessionId: result.session.id,
            phoneNumber: result.user.phoneNumber,
            isGuest: false,
            roles: [result.user.role]
        }, { expiresIn: '1h' });
        return reply.send(ResponseHelper.success({
            user: result.user,
            token,
            refreshToken: result.session.refreshToken,
            message: 'Login successful',
            nextScreen: result.nextScreen
        }));
    }
    async refresh(request, reply) {
        const input = RefreshTokenSchema.parse(request.body);
        const refreshTokenUseCase = request.diScope.resolve('refreshTokenUseCase');
        const result = await refreshTokenUseCase.execute(input);
        const token = await reply.jwtSign({
            id: result.user.id,
            sessionId: result.session.id,
            phoneNumber: result.user.phoneNumber,
            isGuest: result.user.isGuest,
            roles: [result.user.role]
        }, { expiresIn: '1h' });
        return reply.send(ResponseHelper.success({
            token,
            refreshToken: result.session.refreshToken,
            message: 'Token refreshed'
        }));
    }
    async logout(request, reply) {
        const input = LogoutSchema.parse(request.body);
        const logoutUseCase = request.diScope.resolve('logoutUseCase');
        const sessionId = request.user ? request.user.sessionId : undefined;
        await logoutUseCase.execute({ ...input, sessionId });
        return reply.send(ResponseHelper.success({ message: 'Logged out successfully' }));
    }
    async logoutAll(request, reply) {
        const logoutUseCase = request.diScope.resolve('logoutUseCase');
        const userId = request.user ? request.user.id : undefined;
        if (userId) {
            await logoutUseCase.execute({ logoutAll: true, userId });
        }
        return reply.send(ResponseHelper.success({ message: 'Logged out of all devices' }));
    }
    async me(request, reply) {
        if (!request.user) {
            return reply.status(401).send(ResponseHelper.error('Unauthorized'));
        }
        const userRepository = request.diScope.resolve('userRepository');
        const user = await userRepository.findById(request.user.id);
        if (!user) {
            return reply.status(404).send(ResponseHelper.error('User not found'));
        }
        return reply.send(ResponseHelper.success({ user }));
    }
}
//# sourceMappingURL=auth.controller.js.map