import { describe, expect, it } from 'vitest';
import { action, ref } from '../src/index.js';

describe('SDUI action authoring', () => {
  it('creates canonical value references', () => {
    expect(ref.binding('mobileNumber')).toEqual({ $binding: 'mobileNumber' });
    expect(ref.context('deviceId')).toEqual({ $context: 'deviceId' });
    expect(ref.response('data.challengeId')).toEqual({ $response: 'data.challengeId' });
    expect(ref.literal('PARTNER')).toEqual({ $literal: 'PARTNER' });
  });

  it('creates request actions whose destination is returned by the business API', () => {
    expect(action.request({
      method: 'POST',
      endpoint: '/api/v1/partner/auth/send_otp',
      authentication: 'NONE',
      validate: true,
      responseMode: 'destination',
      navigationMode: 'push',
      body: {
        phoneNumber: ref.binding('mobileNumber'),
        deviceId: ref.context('deviceId'),
      },
      contextUpdates: {
        authFlow: { phoneNumber: ref.binding('mobileNumber') },
      },
    })).toEqual({
      type: 'request',
      payload: {
        method: 'POST',
        endpoint: '/api/v1/partner/auth/send_otp',
        authentication: 'NONE',
        validate: true,
        body: {
          phoneNumber: { $binding: 'mobileNumber' },
          deviceId: { $context: 'deviceId' },
        },
        responseMode: 'destination',
        navigationMode: 'push',
        contextUpdates: {
          authFlow: { phoneNumber: { $binding: 'mobileNumber' } },
        },
      },
    });
  });

  it('keeps direct navigation separate from request actions', () => {
    expect(action.navigate({
      screenId: 'partner_profile',
      templateId: 'tpl_profile',
      templateType: 'stack_template',
      endpoint: '/api/v1/partner/screen/profile',
      method: 'GET',
      authentication: 'SESSION',
    }, 'replace')).toEqual({
      type: 'navigate',
      payload: {
        screenId: 'partner_profile',
        templateId: 'tpl_profile',
        templateType: 'stack_template',
        endpoint: '/api/v1/partner/screen/profile',
        method: 'GET',
        authentication: 'SESSION',
      },
      navigationMode: 'replace',
    });
  });

  it('applies safe generic request and navigation defaults', () => {
    expect(action.request({
      method: 'GET', endpoint: '/api/v1/example', authentication: 'SESSION',
    })).toEqual({
      type: 'request',
      payload: {
        method: 'GET',
        endpoint: '/api/v1/example',
        authentication: 'SESSION',
        validate: false,
        responseMode: 'none',
        navigationMode: 'push',
      },
    });

    expect(action.navigate({
      screenId: 'next',
      templateId: 'next_template',
      templateType: 'stack_template',
      endpoint: '/api/v1/screen/next',
      method: 'GET',
      authentication: 'NONE',
    })).toMatchObject({
      type: 'navigate',
      navigationMode: 'push',
      payload: { screenId: 'next' },
    });
  });

  it('creates presentation, state, external uri and sequence actions', () => {
    expect(action.present('cancel_dialog', 'dialog')).toEqual({
      type: 'present', targetId: 'cancel_dialog', payload: { presentation: 'dialog' },
    });
    expect(action.dismiss('cancel_dialog')).toEqual({ type: 'dismiss', targetId: 'cancel_dialog' });
    expect(action.dismiss()).toEqual({ type: 'dismiss' });
    expect(action.state({ targetId: 'referral', operation: 'toggle', property: 'visible' })).toEqual({
      type: 'state', targetId: 'referral', payload: { operation: 'toggle', property: 'visible' },
    });
    expect(action.externalUri(ref.literal('https://example.com/terms'))).toEqual({
      type: 'external_uri', payload: { uri: { $literal: 'https://example.com/terms' } },
    });
    expect(action.sequence([
      action.state({ targetId: 'a', operation: 'set', property: 'visible', value: true }),
      action.state({ targetId: 'b', operation: 'set', property: 'visible', value: false }),
    ])).toMatchObject({ type: 'sequence', payload: { actions: [{ type: 'state' }, { type: 'state' }] } });
  });

  it('rejects invalid state/sequence authoring', () => {
    expect(() => action.state({ targetId: 'x', operation: 'set', property: 'visible' })).toThrow();
    expect(() => action.state({ targetId: 'x', operation: 'toggle', property: 'visible', value: false })).toThrow(
      'SDUI state toggle action must not provide a value',
    );
    expect(() => action.state({ targetId: 'x', operation: 'toggle', property: 'value' })).toThrow();
    expect(() => action.sequence([])).toThrow();
  });
});
