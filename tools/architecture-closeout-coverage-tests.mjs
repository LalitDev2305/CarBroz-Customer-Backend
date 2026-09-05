import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const p = (...parts) => path.join(root, ...parts);
const exists = fs.existsSync;
const write = (file, content) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content.endsWith('\n') ? content : `${content}\n`);
};

function generateObservabilityCoverage() {
  const index = p('platform/observability/src/index.ts');
  const loggerProvider = p('platform/observability/src/adapters/LoggerProvider.ts');
  const auditObserver = p('platform/observability/src/adapters/AuditFailureObserver.ts');
  if (!exists(index) || !exists(loggerProvider) || !exists(auditObserver)) {
    throw new Error('Final canonical Observability files are required before coverage tests are generated');
  }

  write(p('tests/unit/observability.behavior.test.ts'), `import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  pino: vi.fn(),
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn(),
}));

vi.mock('pino', () => ({
  default: mocks.pino,
}));

import { createLogger, getFastifyLoggerConfig, logFlow } from '../../platform/observability/src/index.js';
import { LoggerProvider } from '../../platform/observability/src/adapters/LoggerProvider.js';
import { AuditFailureObserver } from '../../platform/observability/src/adapters/AuditFailureObserver.js';

const fakeLogger = {
  info: mocks.info,
  error: mocks.error,
  warn: mocks.warn,
  debug: mocks.debug,
};

describe('canonical Observability behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.LOG_LEVEL;
    mocks.pino.mockReturnValue(fakeLogger);
  });

  it('creates loggers with the default and explicit levels plus mandatory redaction', () => {
    expect(createLogger()).toBe(fakeLogger);
    expect(mocks.pino).toHaveBeenLastCalledWith(expect.objectContaining({
      level: 'info',
      redact: expect.objectContaining({ censor: '[REDACTED]' }),
    }));

    createLogger('warn');
    const explicitOptions = mocks.pino.mock.calls.at(-1)?.[0];
    expect(explicitOptions.level).toBe('warn');
    expect(explicitOptions.redact.paths).toEqual(expect.arrayContaining([
      'req.headers.authorization',
      'password',
      '*.password',
      'token',
      '*.token',
      'otp',
      '*.otp',
      'phoneNumber',
      '*.phoneNumber',
      'email',
      '*.email',
      'bankAccount',
      '*.bankAccount',
      'secret',
      '*.secret',
    ]));
  });

  it('uses LOG_LEVEL as the process default and returns matching Fastify logger policy', () => {
    process.env.LOG_LEVEL = 'debug';
    createLogger();
    expect(mocks.pino).toHaveBeenLastCalledWith(expect.objectContaining({ level: 'debug' }));

    const config = getFastifyLoggerConfig();
    expect(config.level).toBe('debug');
    expect(config.redact).toEqual(expect.objectContaining({
      censor: '[REDACTED]',
      paths: expect.arrayContaining(['authorization', 'cookie', 'fcmToken', '*.fcmToken']),
    }));

    expect(getFastifyLoggerConfig('error').level).toBe('error');
  });

  it('routes normal flow events to info with only structured safe metadata', () => {
    const logger = { info: vi.fn(), error: vi.fn() };
    const fields = {
      correlationId: 'corr-1',
      method: 'GET',
      route: '/api/v1/customer/bookings',
      surface: 'customer' as const,
      outcome: 'completed' as const,
      statusCode: 200,
      durationMs: 12.5,
    };

    logFlow(logger, 'http.request.completed', fields);

    expect(logger.info).toHaveBeenCalledWith(
      { event: 'http.request.completed', ...fields },
      'http.request.completed',
    );
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('routes failed flow events to error', () => {
    const logger = { info: vi.fn(), error: vi.fn() };
    const fields = {
      correlationId: 'corr-2',
      surface: 'system' as const,
      outcome: 'failed' as const,
      errorCode: 'UNEXPECTED_ERROR',
    };

    logFlow(logger, 'http.request.failed', fields);

    expect(logger.error).toHaveBeenCalledWith(
      { event: 'http.request.failed', ...fields },
      'http.request.failed',
    );
    expect(logger.info).not.toHaveBeenCalled();
  });

  it('adapts the stable logger provider contract across context and empty-context paths', () => {
    const provider = new LoggerProvider();
    const error = new Error('boom');

    provider.info('info-message', { bookingId: 10 });
    provider.info('info-empty');
    provider.warn('warn-message', { partnerId: 20 });
    provider.warn('warn-empty');
    provider.debug('debug-message', { trace: true });
    provider.debug('debug-empty');
    provider.error('error-message', error, { operation: 'test' });
    provider.error('error-empty');

    expect(mocks.info).toHaveBeenNthCalledWith(1, { bookingId: 10 }, 'info-message');
    expect(mocks.info).toHaveBeenNthCalledWith(2, {}, 'info-empty');
    expect(mocks.warn).toHaveBeenNthCalledWith(1, { partnerId: 20 }, 'warn-message');
    expect(mocks.warn).toHaveBeenNthCalledWith(2, {}, 'warn-empty');
    expect(mocks.debug).toHaveBeenNthCalledWith(1, { trace: true }, 'debug-message');
    expect(mocks.debug).toHaveBeenNthCalledWith(2, {}, 'debug-empty');
    expect(mocks.error).toHaveBeenNthCalledWith(1, { operation: 'test', err: error }, 'error-message');
    expect(mocks.error).toHaveBeenNthCalledWith(2, { err: undefined }, 'error-empty');
  });

  it('reports non-blocking Audit persistence failures through the observability adapter', () => {
    const observer = new AuditFailureObserver();
    const error = new Error('audit store unavailable');

    observer.report(error, { operation: 'audit-log-create' });

    expect(mocks.error).toHaveBeenCalledWith(
      { err: error, operation: 'audit-log-create' },
      'audit.persistence.failed',
    );
  });
});
`);
}

generateObservabilityCoverage();
console.log('[architecture-closeout-coverage-tests] final Observability behavioral coverage generated');
