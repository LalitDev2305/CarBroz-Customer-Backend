import type { ILoggerProvider } from '@carbroz/platform-observability';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Msg91SmsProvider } from './Msg91SmsProvider.js';

function createLogger(): ILoggerProvider {
  return {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  };
}

function response(input: {
  ok: boolean;
  status: number;
  json?: () => Promise<unknown>;
}): Response {
  return {
    ok: input.ok,
    status: input.status,
    json: input.json ?? vi.fn().mockResolvedValue({ request_id: 'msg-1' }),
  } as unknown as Response;
}

describe('Msg91SmsProvider observability', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('records metadata-only HTTP provider failures', async () => {
    vi.stubEnv('MSG91_AUTH_KEY', 'provider-auth-key');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response({ ok: false, status: 503 })));
    const logger = createLogger();
    const provider = new Msg91SmsProvider(logger);

    const result = await provider.sendSms({
      phoneNumber: '+919876543210',
      templateId: 'template-private',
      text: 'private-message',
    });

    expect(result).toEqual({ success: false, errorCode: 'MSG91_HTTP_503' });
    expect(logger.warn).toHaveBeenCalledWith('provider.sms.msg91.http_failed', {
      provider: 'MSG91',
      operation: 'sendSms',
      statusCode: 503,
      errorCode: 'MSG91_HTTP_503',
    });
    expect(JSON.stringify(vi.mocked(logger.warn).mock.calls)).not.toContain('+919876543210');
    expect(JSON.stringify(vi.mocked(logger.warn).mock.calls)).not.toContain('template-private');
    expect(JSON.stringify(vi.mocked(logger.warn).mock.calls)).not.toContain('private-message');
  });

  it('does not silently accept an unreadable provider response', async () => {
    vi.stubEnv('MSG91_AUTH_KEY', 'provider-auth-key');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response({
      ok: true,
      status: 200,
      json: vi.fn().mockRejectedValue(new SyntaxError('invalid json')),
    })));
    const logger = createLogger();
    const provider = new Msg91SmsProvider(logger);

    await expect(provider.sendSms({ phoneNumber: '+911111111111', templateId: 'template' }))
      .resolves.toEqual({ success: false, errorCode: 'MSG91_INVALID_RESPONSE' });
    expect(logger.warn).toHaveBeenCalledWith('provider.sms.msg91.invalid_response', {
      provider: 'MSG91',
      operation: 'sendSms',
      statusCode: 200,
      errorCode: 'MSG91_INVALID_RESPONSE',
    });
  });

  it('records network failure metadata without logging recipient or payload data', async () => {
    vi.stubEnv('MSG91_AUTH_KEY', 'provider-auth-key');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('network unavailable')));
    const logger = createLogger();
    const provider = new Msg91SmsProvider(logger);

    const result = await provider.sendSms({
      phoneNumber: '+912222222222',
      templateId: 'template-private',
      text: 'private-message',
    });

    expect(result).toEqual({ success: false, errorCode: 'MSG91_UNAVAILABLE' });
    expect(logger.error).toHaveBeenCalledWith('provider.sms.msg91.unavailable', undefined, {
      provider: 'MSG91',
      operation: 'sendSms',
      errorCode: 'MSG91_UNAVAILABLE',
      errorName: 'TypeError',
    });
    const logged = JSON.stringify(vi.mocked(logger.error).mock.calls);
    expect(logged).not.toContain('+912222222222');
    expect(logged).not.toContain('template-private');
    expect(logged).not.toContain('private-message');
  });

  it('records missing OTP provider configuration without exposing OTP data', async () => {
    vi.stubEnv('MSG91_AUTH_KEY', 'provider-auth-key');
    vi.stubEnv('MSG91_OTP_TEMPLATE_ID', '');
    vi.stubEnv('MSG91_OTP_VARIABLE_NAME', '');
    const logger = createLogger();
    const provider = new Msg91SmsProvider(logger);

    const result = await provider.sendOtp({ phoneNumber: '+913333333333', otp: '987654' });

    expect(result).toEqual({ success: false, errorCode: 'MSG91_OTP_NOT_CONFIGURED' });
    expect(logger.warn).toHaveBeenCalledWith('provider.sms.msg91.delivery_configuration_missing', {
      provider: 'MSG91',
      operation: 'sendOtp',
      errorCode: 'MSG91_OTP_NOT_CONFIGURED',
    });
    expect(JSON.stringify(vi.mocked(logger.warn).mock.calls)).not.toContain('987654');
    expect(JSON.stringify(vi.mocked(logger.warn).mock.calls)).not.toContain('+913333333333');
  });

  it('returns provider references on successful delivery without failure logs', async () => {
    vi.stubEnv('MSG91_AUTH_KEY', 'provider-auth-key');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ request_id: 'provider-ref-1', type: 'success' }),
    })));
    const logger = createLogger();
    const provider = new Msg91SmsProvider(logger);

    await expect(provider.sendSms({ phoneNumber: '+914444444444', templateId: 'template' }))
      .resolves.toEqual({ success: true, providerReference: 'provider-ref-1' });
    expect(logger.warn).not.toHaveBeenCalled();
    expect(logger.error).not.toHaveBeenCalled();
  });
});
