import { z } from 'zod';
const mobileRegex = /^\+?[1-9]\d{1,14}$/;
export const sendOtpSchema = z.object({
    mobileNumber: z.string().regex(mobileRegex, 'Invalid mobile number format'),
});
export const verifyOtpSchema = z.object({
    mobileNumber: z.string().regex(mobileRegex, 'Invalid mobile number format'),
    otp: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d+$/, 'OTP must be numeric'),
    deviceId: z.string().min(1, 'Device ID is required'),
    platform: z.enum(['ios', 'android', 'web']),
    appVersion: z.string().min(1, 'App version is required'),
});
export const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
    deviceId: z.string().min(1, 'Device ID is required'),
});
export const logoutSchema = z.object({
    deviceId: z.string().min(1, 'Device ID is required'),
});
//# sourceMappingURL=auth.validator.js.map