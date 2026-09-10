import { describe, expect, it, vi } from 'vitest';
import { SduiRegistryController } from '../../apps/api/src/transport/sdui/sdui-registry.controller.js';

describe('SDUI registry transport', () => {
  it('resolves explicit and default target apps before invoking the registry use case', async () => {
    const execute = vi.fn(async ({ data }: { data: { screenId: string; targetApp: string } }) => ({
      screenId: data.screenId,
      targetApp: data.targetApp,
    }));
    const controller = new SduiRegistryController({ execute } as any);
    const reply = { send: vi.fn((value: unknown) => value) } as any;

    await controller.getScreen({
      params: { screenId: 'partner_login' },
      query: { targetApp: 'PARTNER' },
    } as any, reply);

    await controller.getScreen({
      params: { screenId: 'customer_home' },
      query: {},
    } as any, reply);

    expect(execute).toHaveBeenNthCalledWith(1, {
      data: { screenId: 'partner_login', targetApp: 'PARTNER' },
    });
    expect(execute).toHaveBeenNthCalledWith(2, {
      data: { screenId: 'customer_home', targetApp: 'CUSTOMER' },
    });
    expect(reply.send).toHaveBeenCalledTimes(2);
  });
});
