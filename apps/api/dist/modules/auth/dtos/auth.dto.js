import { z } from 'zod';
export const SendOtpSchema = z.object({
    phoneNumber: z.string().min(10, 'Phone number is required'),
    deviceId: z.string().min(1, 'Device ID is required'),
});
export const VerifyOtpSchema = z.object({
    phoneNumber: z.string().min(10, 'Phone number is required'),
    otp: z.string().min(6, 'OTP is required'),
    deviceId: z.string().min(1, 'Device ID is required'),
    deviceModel: z.string().optional(),
    osVersion: z.string().optional(),
    fcmToken: z.string().optional(),
});
export const GuestLoginSchema = z.object({
    deviceId: z.string().min(1, 'Device ID is required'),
    deviceModel: z.string().optional(),
    osVersion: z.string().optional(),
    fcmToken: z.string().optional(),
});
export const RefreshTokenSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
    deviceId: z.string().min(1, 'Device ID is required'),
});
export const LogoutSchema = z.object({
    deviceId: z.string().optional(),
});
//# sourceMappingURL=auth.dto.js.map