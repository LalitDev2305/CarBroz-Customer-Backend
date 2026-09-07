import { describe, expect, it, vi } from 'vitest';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { PartnerBootstrapController } from './partner.bootstrap.controller.js';

describe('PartnerBootstrapController', () => {
  it('rejects a supplied invalid bearer before bootstrap business evaluation', async () => {
    const execute = vi.fn();
    const jwtVerify = vi.fn().mockRejectedValue(new Error('invalid bearer'));
    const request = {
      headers: {
        authorization: 'Bearer invalid',
        'x-carbroz-platform': 'ANDROID',
        'x-carbroz-app-version': '1.0.0-dev',
        'x-carbroz-build-number': '1',
      },
      user: undefined,
      jwtVerify,
      diScope: { resolve: vi.fn(() => ({ execute })) },
      traceId: 'req-test',
    } as unknown as FastifyRequest;
    const reply = {} as FastifyReply;

    await expect(new PartnerBootstrapController().get(request, reply)).rejects.toThrow('invalid bearer');
    expect(jwtVerify).toHaveBeenCalledOnce();
    expect(execute).not.toHaveBeenCalled();
  });

  it('does not require authentication when no bearer is supplied', async () => {
    const execute = vi.fn().mockResolvedValue({
      config: {},
      startup: { authenticated: false, nextScreen: {} },
    });
    const send = vi.fn((body) => body);
    const status = vi.fn(() => ({ send }));
    const request = {
      headers: {
        'x-carbroz-platform': 'DESKTOP',
        'x-carbroz-app-version': '1.0.0-dev+42',
        'x-carbroz-build-number': '42',
      },
      user: undefined,
      jwtVerify: vi.fn(),
      diScope: { resolve: vi.fn(() => ({ execute })) },
      traceId: 'req-test',
    } as unknown as FastifyRequest;
    const reply = { status } as unknown as FastifyReply;

    await new PartnerBootstrapController().get(request, reply);

    expect(request.jwtVerify).not.toHaveBeenCalled();
    expect(execute).toHaveBeenCalledWith({
      platform: 'DESKTOP',
      appVersion: '1.0.0-dev+42',
      authenticated: false,
    });
    expect(status).toHaveBeenCalledWith(200);
    expect(send).toHaveBeenCalledOnce();
  });
});
