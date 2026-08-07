import { z } from 'zod';
export declare const SendOtpSchema: z.ZodObject<{
    phoneNumber: z.ZodString;
    deviceId: z.ZodString;
}, z.core.$strip>;
export declare const VerifyOtpSchema: z.ZodObject<{
    phoneNumber: z.ZodString;
    otp: z.ZodString;
    deviceId: z.ZodString;
    deviceModel: z.ZodOptional<z.ZodString>;
    osVersion: z.ZodOptional<z.ZodString>;
    fcmToken: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const GuestLoginSchema: z.ZodObject<{
    deviceId: z.ZodString;
    deviceModel: z.ZodOptional<z.ZodString>;
    osVersion: z.ZodOptional<z.ZodString>;
    fcmToken: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const RefreshTokenSchema: z.ZodObject<{
    refreshToken: z.ZodString;
    deviceId: z.ZodString;
}, z.core.$strip>;
export declare const LogoutSchema: z.ZodObject<{
    deviceId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
