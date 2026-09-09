import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  emitFlowDiagnostic,
  emitHttpErrorDiagnostic,
  emitHttpRequestDiagnostic,
  emitHttpResponseDiagnostic,
} from '../src/index.js';

afterEach(() => vi.restoreAllMocks());

describe('local http diagnostic presentation', () => {
  it('is silent when detailed diagnostics are disabled', () => {
    const stdout = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    const stderr = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);

    emitFlowDiagnostic(false, 'corr-1', 'A()', 'B()');
    emitHttpRequestDiagnostic(false, {
      correlationId: 'corr-1',
      method: 'POST',
      url: '/api/v1/partner/test',
    });
    emitHttpResponseDiagnostic(false, {
      correlationId: 'corr-1',
      method: 'POST',
      url: '/api/v1/partner/test',
      statusCode: 200,
      body: { status: 200, code: 'SUCCESS' },
    });
    emitHttpErrorDiagnostic(false, {
      correlationId: 'corr-1',
      method: 'POST',
      url: '/api/v1/partner/test',
      statusCode: 400,
      errorCode: 'INVALID_REQUEST',
    });

    expect(stdout).not.toHaveBeenCalled();
    expect(stderr).not.toHaveBeenCalled();
  });

  it('prints metadata-only request diagnostics and sanitizes sensitive query values', () => {
    let output = '';
    vi.spyOn(process.stdout, 'write').mockImplementation((chunk: string | Uint8Array) => {
      output += chunk.toString();
      return true;
    });

    emitHttpRequestDiagnostic(true, {
      correlationId: 'corr-request',
      method: 'POST',
      url: '/api/v1/partner/auth?mode=test&token=private-query',
    });

    expect(output).toContain('API REQUEST');
    expect(output).toContain('corr-request');
    expect(output).toContain('POST');
    expect(output).toContain('token=%5BREDACTED%5D');
    expect(output).not.toContain('private-query');
    expect(output).not.toContain('HEADERS');
    expect(output).not.toContain('BODY');
  });

  it('prints pretty json response and redacts sensitive response fields', () => {
    let output = '';
    vi.spyOn(process.stdout, 'write').mockImplementation((chunk: string | Uint8Array) => {
      output += chunk.toString();
      return true;
    });

    emitHttpResponseDiagnostic(true, {
      correlationId: 'corr-response',
      method: 'GET',
      url: '/api/v1/partner/bootstrap',
      statusCode: 200,
      durationMs: 12.5,
      body: JSON.stringify({
        status: 200,
        code: 'SUCCESS',
        data: { startup: { nextScreen: { screenId: 'partner_login' } }, email: 'private-email' },
      }),
    });

    expect(output).toContain('API RESPONSE');
    expect(output).toContain('partner_login');
    expect(output).toContain('"status": 200');
    expect(output).toContain('[REDACTED]');
    expect(output).not.toContain('private-email');
  });

  it('prints failures to stderr as one api error block', () => {
    let output = '';
    vi.spyOn(process.stderr, 'write').mockImplementation((chunk: string | Uint8Array) => {
      output += chunk.toString();
      return true;
    });

    emitHttpErrorDiagnostic(true, {
      correlationId: 'corr-error',
      method: 'GET',
      url: '/api/v1/partner/bootstrap',
      statusCode: 500,
      durationMs: 9,
      errorCode: 'INTERNAL_SERVER_ERROR',
      body: { status: 500, code: 'INTERNAL_SERVER_ERROR', data: null },
    });

    expect(output).toContain('API ERROR');
    expect(output).toContain('INTERNAL_SERVER_ERROR');
    expect(output).toContain('500');
  });
});
