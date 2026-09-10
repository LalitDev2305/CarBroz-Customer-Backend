import { describe, expect, it } from 'vitest';
import { binding, context, literal, requestAction, response } from '../src/index.js';

describe('SDUI action helpers', () => {
  it('creates canonical value references', () => {
    expect(binding('mobileNumber')).toEqual({ $binding: 'mobileNumber' });
    expect(context('deviceId')).toEqual({ $context: 'deviceId' });
    expect(response('challengeId')).toEqual({ $response: 'challengeId' });
    expect(literal('PARTNER')).toEqual({ $literal: 'PARTNER' });
  });

  it('creates the canonical request action with defaults', () => {
    expect(requestAction({
      method: 'POST',
      endpoint: '/api/v1/partner/auth/send_otp',
      authentication: 'NONE',
      body: {
        phoneNumber: binding('mobileNumber'),
        deviceId: context('deviceId'),
      },
    })).toEqual({
      type: 'request',
      payload: {
        method: 'POST',
        endpoint: '/api/v1/partner/auth/send_otp',
        authentication: 'NONE',
        validate: false,
        body: {
          phoneNumber: { $binding: 'mobileNumber' },
          deviceId: { $context: 'deviceId' },
        },
        responseMode: 'none',
      },
    });
  });
});
