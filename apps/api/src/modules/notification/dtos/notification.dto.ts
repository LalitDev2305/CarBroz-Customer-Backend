import { z } from 'zod';

export const registerDeviceTokenSchema = z.object({
  deviceId: z.string().min(1),
  platform: z.enum(['ANDROID', 'IOS', 'WEB']),
  token: z.string().min(1),
  appVersion: z.string().optional(),
});

export const deactivateDeviceTokenSchema = z.object({
  deviceId: z.string().min(1),
});

export const sendNotificationSchema = z.object({
  channel: z.enum(['PUSH', 'SMS', 'EMAIL']),
  templateId: z.string().min(1),
  recipient: z.string().min(1),
  recipientId: z.number().int().positive(),
  bookingId: z.number().int().positive().optional(),
  title: z.string().optional(),
  body: z.string().optional(),
  data: z.record(z.string(), z.any()).optional(),
});

export type RegisterDeviceTokenDto = z.infer<typeof registerDeviceTokenSchema>;
export type DeactivateDeviceTokenDto = z.infer<typeof deactivateDeviceTokenSchema>;
export type SendNotificationDto = z.infer<typeof sendNotificationSchema>;
