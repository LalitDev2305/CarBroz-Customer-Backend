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
      recipient: 'token-1',
      title: 'Alert',
      body: 'Body',
    });
    expect(result.success).toBe(true);
    expect(result.provider).toBe('FIREBASE_FCM');
  });

  it('should dispatch SMS notification', async () => {
    const result = await provider.dispatch({
      channel: 'SMS',
      recipient: '+1234567890',
      body: 'Your OTP is 1234',
    });
    expect(result.success).toBe(true);
    expect(result.provider).toBe('MSG91');
  });

  it('should dispatch email notification', async () => {
    const result = await provider.dispatch({
      channel: 'EMAIL',
      recipient: 'user@example.com',
      title: 'Welcome',
      body: '<p>Welcome</p>',
    });
    expect(result.success).toBe(true);
    expect(result.provider).toBe('RESEND');
  });
});
