import { getPrismaClient } from '@carbroz/database';
import { ResponseHelper } from '@carbroz/common';
export class AuthController {
    async sendOtp(request, reply) {
        const { phone } = request.body;
        if (!phone) {
            return reply.status(400).send(ResponseHelper.error('Phone number is required'));
        }
        // Mock OTP sending
        return reply.send(ResponseHelper.success({
            message: 'OTP sent successfully (Mock)',
            mockOtp: '1234'
        }));
    }
    async verifyOtp(request, reply) {
        const { phone, otp } = request.body;
        if (!phone || !otp) {
            return reply.status(400).send(ResponseHelper.error('Phone and OTP are required'));
        }
        if (otp !== '1234') {
            return reply.status(400).send(ResponseHelper.error('Invalid OTP'));
        }
        const prisma = getPrismaClient();
        // Upsert User in Postgres
        const user = await prisma.user.upsert({
            where: { phone },
            update: {},
            create: { phone, role: 'CUSTOMER' }
        });
        // Generate JWT
        const token = await reply.jwtSign({
            id: user.id,
            phone: user.phone,
            roles: [user.role]
        });
        return reply.send(ResponseHelper.success({
            user,
            token,
            message: 'Login successful'
        }));
    }
    async refresh(request, reply) {
        return reply.status(501).send(ResponseHelper.error('Not Implemented'));
    }
    async logout(request, reply) {
        return reply.send(ResponseHelper.success({ message: 'Logged out successfully' }));
    }
    async logoutAll(request, reply) {
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