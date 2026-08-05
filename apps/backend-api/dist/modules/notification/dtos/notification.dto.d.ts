import { z } from 'zod';
export declare const registerDeviceTokenSchema: z.ZodObject<{
    deviceId: z.ZodString;
    platform: z.ZodEnum<{
        ANDROID: "ANDROID";
        IOS: "IOS";
        WEB: "WEB";
    }>;
    token: z.ZodString;
    appVersion: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const deactivateDeviceTokenSchema: z.ZodObject<{
    deviceId: z.ZodString;
}, z.core.$strip>;
export declare const sendNotificationSchema: z.ZodObject<{
    channel: z.ZodEnum<{
        PUSH: "PUSH";
        SMS: "SMS";
        EMAIL: "EMAIL";
    }>;
    templateId: z.ZodString;
    recipient: z.ZodString;
    recipientId: z.ZodNumber;
    bookingId: z.ZodOptional<z.ZodNumber>;
    title: z.ZodOptional<z.ZodString>;
    body: z.ZodOptional<z.ZodString>;
    data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, z.core.$strip>;
export type RegisterDeviceTokenDto = z.infer<typeof registerDeviceTokenSchema>;
export type DeactivateDeviceTokenDto = z.infer<typeof deactivateDeviceTokenSchema>;
export type SendNotificationDto = z.infer<typeof sendNotificationSchema>;
