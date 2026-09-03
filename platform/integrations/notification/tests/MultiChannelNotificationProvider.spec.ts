import { describe, it, expect, vi } from 'vitest';
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
    mockEmailProvider as any
  );

  it('should dispatch push notification', async () => {
    const result = await provider.dispatch({
      channel: 'PUSH',
      templateId: 'test-template',
      recipient: 'token-1',
      recipientId: 1,
      bookingId: null,
      title: 'Alert',
      body: 'Body',
      data: {},
    });
    expect(result.success).toBe(true);
    expect(result.provider).toBe('FIREBASE_FCM');
  });

  it('should dispatch SMS notification', async () => {
    const result = await provider.dispatch({
      channel: 'SMS',
      templateId: 'test-template',
      recipient: '+1234567890',
      recipientId: 1,
      bookingId: null,
      title: '',
      body: 'Your OTP is 1234',
      data: {},
    });
    expect(result.success).toBe(true);
    expect(result.provider).toBe('MSG91');
  });

  it('should dispatch email notification', async () => {
    const result = await provider.dispatch({
      channel: 'EMAIL',
      templateId: 'test-template',
      recipient: 'user@example.com',
      recipientId: 1,
      bookingId: null,
      title: 'Welcome',
      body: '<p>Welcome</p>',
      data: {},
    });
    expect(result.success).toBe(true);
    expect(result.provider).toBe('RESEND');
  });
});
