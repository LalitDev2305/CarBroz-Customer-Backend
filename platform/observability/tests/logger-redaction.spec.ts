import { Writable } from 'node:stream';
import pino from 'pino';
import { describe, expect, it } from 'vitest';
import {
  getFastifyLoggerConfig,
  redactSensitiveMetadata,
  SENSITIVE_PATHS,
} from '../src/index.js';

function captureOneLog(metadata: Record<string, unknown>): Record<string, unknown> {
  let output = '';
  const destination = new Writable({
    write(chunk, _encoding, callback) {
      output += chunk.toString();
      callback();
    },
  });
  const logger = pino(getFastifyLoggerConfig('info'), destination);
  logger.info(metadata, 'privacy-proof');
  return JSON.parse(output.trim()) as Record<string, unknown>;
}

describe('observability privacy redaction', () => {
  it('recursively redacts contact, address, coordinates, KYC, payment and vendor-secret metadata', () => {
    const privateValues = [
      '+919876543210',
      'Private street address',
      'PAN-PRIVATE',
      'private@upi',
      'maps-secret',
      'sms-secret',
      'storage-access',
      'storage-secret',
      'payment-secret',
    ];
    const sanitized = redactSensitiveMetadata({
      nested: {
        phoneNumber: privateValues[0],
        address: privateValues[1],
        coordinates: { latitude: 18.52, longitude: 73.85 },
        kyc: { documentNumber: privateValues[2] },
        paymentDetails: { upiId: privateValues[3] },
        provider: {
          apiKey: privateValues[4],
          authKey: privateValues[5],
          accessKey: privateValues[6],
          secretKey: privateValues[7],
          keySecret: privateValues[8],
        },
      },
    });
    const serialized = JSON.stringify(sanitized);

    for (const privateValue of privateValues) expect(serialized).not.toContain(privateValue);
    expect(serialized.match(/\[REDACTED\]/g)?.length).toBeGreaterThanOrEqual(6);
  });

  it('redacts sensitive values in actual Pino output while preserving safe metadata', () => {
    const entry = captureOneLog({
      correlationId: 'corr-safe',
      operation: 'provider-call',
      authorization: 'Bearer private-token',
      address: 'Private address',
      latitude: 18.52,
      apiKey: 'private-api-key',
      rawBody: '{"card":"private"}',
    });

    expect(entry.correlationId).toBe('corr-safe');
    expect(entry.operation).toBe('provider-call');
    expect(entry.authorization).toBe('[REDACTED]');
    expect(entry.address).toBe('[REDACTED]');
    expect(entry.latitude).toBe('[REDACTED]');
    expect(entry.apiKey).toBe('[REDACTED]');
    expect(entry.rawBody).toBe('[REDACTED]');
  });

  it('replaces direct circular references without weakening sensitive-field redaction', () => {
    const metadata: Record<string, unknown> = {
      correlationId: 'corr-cycle',
      authorization: 'Bearer private-token',
      phoneNumber: '+919876543210',
      safeValue: 'preserved',
    };
    metadata.self = metadata;

    const sanitized = redactSensitiveMetadata(metadata) as Record<string, unknown>;

    expect(sanitized.correlationId).toBe('corr-cycle');
    expect(sanitized.safeValue).toBe('preserved');
    expect(sanitized.authorization).toBe('[REDACTED]');
    expect(sanitized.phoneNumber).toBe('[REDACTED]');
    expect(sanitized.self).toBe('[Circular]');
  });

  it('handles circular metadata in actual Pino output without overflowing the stack', () => {
    const nested: Record<string, unknown> = { operation: 'request-log' };
    const metadata: Record<string, unknown> = {
      correlationId: 'corr-pino-cycle',
      apiKey: 'private-api-key',
      nested,
    };
    nested.parent = metadata;

    const entry = captureOneLog(metadata);
    const sanitizedNested = entry.nested as Record<string, unknown>;

    expect(entry.correlationId).toBe('corr-pino-cycle');
    expect(entry.apiKey).toBe('[REDACTED]');
    expect(sanitizedNested.operation).toBe('request-log');
    expect(sanitizedNested.parent).toBe('[Circular]');
  });

  it('does not treat repeated non-cyclic references as circular', () => {
    const shared = { status: 'ok' };
    const sanitized = redactSensitiveMetadata({ first: shared, second: shared }) as Record<string, unknown>;

    expect(sanitized.first).toEqual({ status: 'ok' });
    expect(sanitized.second).toEqual({ status: 'ok' });
  });

  it('does not traverse DI runtime proxies while still redacting adjacent request metadata', () => {
    const lazyDiProxy = new Proxy<Record<string, unknown>>({}, {
      ownKeys() {
        throw new Error('DI runtime proxy must not be enumerated by observability');
      },
    });

    const sanitized = redactSensitiveMetadata({
      req: {
        headers: {
          authorization: 'Bearer private-token',
        },
        diScope: lazyDiProxy,
      },
    }) as {
      req: {
        headers: { authorization: string };
        diScope: string;
      };
    };

    expect(sanitized.req.headers.authorization).toBe('[REDACTED]');
    expect(sanitized.req.diScope).toBe('[Internal]');
  });

  it('keeps defense-in-depth Pino paths for HTTP auth/cookies and core secrets', () => {
    expect(SENSITIVE_PATHS).toEqual(expect.arrayContaining([
      'req.headers.authorization',
      'req.headers.cookie',
      'refreshToken',
      'otp',
      'phoneNumber',
      'address',
      'coordinates',
      'apiKey',
      'authKey',
      'accessKey',
      'secretKey',
      'keySecret',
      'rawBody',
    ]));
  });
});
