import { describe, it, expect, vi } from 'vitest';
import { NotificationPayload } from '@carbroz/common';
import { MultiChannelNotificationProvider } from '../src/providers/MultiChannelNotificationProvider.js';

describe('MultiChannelNotificationProvider', () => {
  const mockPushProvider = {
    sendPush: vi.fn().mockResolvedValue({ successCount: 1, providerReference: 'fcm-123' }),
  };
  const mockSmsProvider = {
    sendSms: vi.fn().mockResolvedValue({ success: true, providerReference: 'msg91-456' }),
  };
  const mockEmailProvider = {
    sendEmail: vi.fn().mockResolvedValue({ success: true, providerReference: 'resend-789' }),
  };

  const provider = new MultiChannelNotificationProvider(
    mockPushProvider as any,
    mockSmsProvider as any,
    mockEmailProvider as any,
  );

  it('should dispatch push notification', async () => {
    const result = await provider.dispatch(
      new NotificationPayload({
        channel: 'PUSH',
        templateId: 'booking-status-push',
        recipient: 'token-1',
        recipientId: 1,
        bookingId: 101,
        title: 'Alert',
        body: 'Body',
        data: { status: 'CONFIRMED' },
      }),
    );

    expect(result.success).toBe(true);
    expect(result.provider).toBe('FIREBASE_FCM');
    expect(mockPushProvider.sendPush).toHaveBeenCalledWith({
      tokens: ['token-1'],
      title: 'Alert',
      body: 'Body',
      data: { status: 'CONFIRMED' },
    });
  });

  it('should dispatch SMS notification', async () => {
    const result = await provider.dispatch(
      new NotificationPayload({
        channel: 'SMS',
        templateId: 'otp-sms',
        recipient: '+1234567890',
        recipientId: 2,
        body: 'Your OTP is 1234',
      }),
    );

    expect(result.success).toBe(true);
    expect(result.provider).toBe('MSG91');
    expect(mockSmsProvider.sendSms).toHaveBeenCalledWith({
      phoneNumber: '+1234567890',
      templateId: 'otp-sms',
      text: 'Your OTP is 1234',
    });
  });

  it('should dispatch email notification', async () => {
    const result = await provider.dispatch(
      new NotificationPayload({
        channel: 'EMAIL',
        templateId: 'welcome-email',
        recipient: 'user@example.com',
        recipientId: 3,
        title: 'Welcome',
        body: '<p>Welcome</p>',
      }),
    );

    expect(result.success).toBe(true);
    expect(result.provider).toBe('RESEND');
    expect(mockEmailProvider.sendEmail).toHaveBeenCalledWith({
      toEmail: 'user@example.com',
      subject: 'Welcome',
      htmlBody: '<p>Welcome</p>',
      templateId: 'welcome-email',
    });
  });
});
