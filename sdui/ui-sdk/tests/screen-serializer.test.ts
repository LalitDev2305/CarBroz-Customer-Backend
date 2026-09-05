import { describe, expect, it } from 'vitest';
import { ScreenSerializer } from '../src/serializer/ScreenSerializer.js';

const screen = {
  screenId: 'auth_login',
  templateId: 't1',
  templateType: 'auth',
  schemaVersion: '3.0.0',
  targetApp: 'CUSTOMER' as const,
  template: { id: 't1', type: 'auth', components: [] },
};

describe('ScreenSerializer', () => {
  it('serializes only a schema-valid canonical screen and round-trips it losslessly', () => {
    const json = ScreenSerializer.serialize(screen);
    expect(JSON.parse(json)).toEqual(screen);
    expect(ScreenSerializer.deserialize(json)).toEqual(screen);
  });

  it('rejects schema-invalid input during serialization', () => {
    expect(() => ScreenSerializer.serialize({ ...screen, screenId: '' })).toThrow();
  });

  it('rejects malformed JSON during deserialization', () => {
    expect(() => ScreenSerializer.deserialize('{not-json')).toThrow(SyntaxError);
  });

  it('rejects valid JSON that violates the canonical screen schema', () => {
    expect(() => ScreenSerializer.deserialize(JSON.stringify({ screenId: 'auth_login' }))).toThrow();
  });
});
