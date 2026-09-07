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
