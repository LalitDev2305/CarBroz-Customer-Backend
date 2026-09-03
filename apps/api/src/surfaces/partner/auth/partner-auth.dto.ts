import { z } from 'zod';

export const PartnerGuestLoginSchema = z.object({
  deviceId: z.string().min(1),
  deviceModel: z.string().min(1).optional(),
  osVersion: z.string().min(1).optional(),
  fcmToken: z.string().min(1).optional(),
});

export const PartnerSendOtpSchema = z.object({
  phoneNumber: z.string().min(1),
  deviceId: z.string().min(1),
});

export const PartnerVerifyOtpSchema = z.object({
  phoneNumber: z.string().min(1),
  otp: z.string().min(1),
  deviceId: z.string().min(1),
  deviceModel: z.string().min(1).optional(),
  osVersion: z.string().min(1).optional(),
  fcmToken: z.string().min(1).optional(),
});

export const PartnerRefreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
  deviceId: z.string().min(1),
});

export const PartnerLogoutSchema = z.object({
  deviceId: z.string().min(1).optional(),
});
