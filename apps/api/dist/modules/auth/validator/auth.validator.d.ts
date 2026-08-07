import { z } from 'zod';
export declare const sendOtpSchema: z.ZodObject<{
    mobileNumber: z.ZodString;
}, z.core.$strip>;
export declare const verifyOtpSchema: z.ZodObject<{
    mobileNumber: z.ZodString;
    otp: z.ZodString;
    deviceId: z.ZodString;
    platform: z.ZodEnum<{
        ios: "ios";
        android: "android";
        web: "web";
    }>;
    appVersion: z.ZodString;
}, z.core.$strip>;
export declare const refreshTokenSchema: z.ZodObject<{
    refreshToken: z.ZodString;
    deviceId: z.ZodString;
}, z.core.$strip>;
export declare const logoutSchema: z.ZodObject<{
    deviceId: z.ZodString;
}, z.core.$strip>;
