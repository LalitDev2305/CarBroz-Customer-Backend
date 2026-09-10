import { describe, expect, it } from 'vitest';
import { actionSchema, elementSchema } from '../src/public/index.js';

describe('SDUI action contract', () => {
  it('accepts a bound request action', () => {
    expect(actionSchema.parse({
      type: 'request',
      payload: {
        method: 'POST', endpoint: '/api/v1/partner/auth/send_otp', authentication: 'NONE', validate: true,
        body: { mobileNumber: { $binding: 'mobileNumber' } }, responseMode: 'destination',
      },
    }).type).toBe('request');
  });

  it('accepts dynamic navigation metadata', () => {
    expect(actionSchema.safeParse({
      type: 'navigate',
      payload: { screenId: 'partner_profile', templateId: 'tpl_7K2M9Q', templateType: 'stack_template', endpoint: '/api/v1/partner/screen/profile', method: 'GET', authentication: 'SESSION' },
    }).success).toBe(true);
  });

  it.each(['dialog', 'bottom_sheet', 'popup'])('accepts %s presentation', (presentation) => {
    expect(actionSchema.safeParse({ type: 'present', targetId: 'overlay', payload: { presentation } }).success).toBe(true);
  });

  it('accepts controlled local state mutation', () => {
    expect(actionSchema.safeParse({ type: 'state', targetId: 'details', payload: { operation: 'toggle', property: 'visible' } }).success).toBe(true);
  });

  it('rejects arbitrary visual state mutation', () => {
    expect(actionSchema.safeParse({ type: 'state', targetId: 'details', payload: { operation: 'set', property: 'background.color', value: '#000000' } }).success).toBe(false);
  });

  it('rejects state set without a value', () => {
    expect(actionSchema.safeParse({ type: 'state', targetId: 'details', payload: { operation: 'set', property: 'visible' } }).success).toBe(false);
  });

  it('rejects state toggle when a value is supplied', () => {
    expect(actionSchema.safeParse({ type: 'state', targetId: 'details', payload: { operation: 'toggle', property: 'visible', value: true } }).success).toBe(false);
  });

  it('rejects value toggle because value is not boolean runtime state', () => {
    expect(actionSchema.safeParse({ type: 'state', targetId: 'input', payload: { operation: 'toggle', property: 'value' } }).success).toBe(false);
  });

  it('accepts an ordered sequence', () => {
    expect(actionSchema.safeParse({ type: 'sequence', payload: { actions: [
      { type: 'state', targetId: 'individual_fields', payload: { operation: 'set', property: 'visible', value: true } },
      { type: 'state', targetId: 'organization_fields', payload: { operation: 'set', property: 'visible', value: false } },
    ] } }).success).toBe(true);
  });

  it('accepts a typed input binding and rejects arbitrary binding bags', () => {
    expect(elementSchema.safeParse({ id: 'phone', type: 'input', binding: { key: 'mobileNumber' } }).success).toBe(true);
    expect(elementSchema.safeParse({ id: 'phone', type: 'input', binding: { source: 'anything' } }).success).toBe(false);
  });
});
