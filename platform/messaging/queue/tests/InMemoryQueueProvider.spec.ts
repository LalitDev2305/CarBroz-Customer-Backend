import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InMemoryQueueProvider } from '../src/providers/InMemoryQueueProvider.js';

describe('InMemoryQueueProvider', () => {
  let queueProvider: InMemoryQueueProvider;

  beforeEach(() => {
    vi.useRealTimers();
    queueProvider = new InMemoryQueueProvider();
  });

  it('enqueues jobs without handlers and preserves supplied options', async () => {
    const job = await queueProvider.enqueue(
      'notifications',
      'send_email',
      { to: 'test@carbroz.com' },
      { attempts: 3, removeOnComplete: true },
    );

    expect(job.id).toBe('job-1');
    expect(job.name).toBe('send_email');
    expect(job.data).toEqual({ to: 'test@carbroz.com' });
    expect(job.timestamp).toEqual(expect.any(Number));
  });

  it('reuses an existing queue and generates monotonically increasing job ids', async () => {
    const first = await queueProvider.enqueue('notifications', 'first', { order: 1 });
    const second = await queueProvider.enqueue('notifications', 'second', { order: 2 });

    expect(first.id).toBe('job-1');
    expect(second.id).toBe('job-2');
  });

  it('processes registered handlers immediately when no delay is supplied', async () => {
    vi.useFakeTimers();
    const handler = vi.fn(async () => undefined);
    queueProvider.process('notifications', handler);

    const job = await queueProvider.enqueue('notifications', 'send_email', { payload: 'hello' });
    await vi.runAllTimersAsync();

    expect(handler).toHaveBeenCalledWith(job);
  });

  it('honors delayed processing options', async () => {
    vi.useFakeTimers();
    const handler = vi.fn(async () => undefined);
    queueProvider.process('notifications', handler);

    const job = await queueProvider.enqueue(
      'notifications',
      'send_later',
      { payload: 'later' },
      { delay: 250 },
    );

    await vi.advanceTimersByTimeAsync(249);
    expect(handler).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(handler).toHaveBeenCalledWith(job);
  });

  it('contains asynchronous handler failures so enqueue callers are not affected', async () => {
    vi.useFakeTimers();
    const handler = vi.fn(async () => {
      throw new Error('worker failed');
    });
    queueProvider.process('notifications', handler);

    await expect(queueProvider.enqueue('notifications', 'send_email', { payload: 'hello' }))
      .resolves.toEqual(expect.objectContaining({ name: 'send_email' }));
    await vi.runAllTimersAsync();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('clears queues and handlers on close', async () => {
    vi.useFakeTimers();
    const oldHandler = vi.fn(async () => undefined);
    queueProvider.process('notifications', oldHandler);
    await queueProvider.enqueue('notifications', 'before_close', {});
    await vi.runAllTimersAsync();
    expect(oldHandler).toHaveBeenCalledTimes(1);

    await queueProvider.close();
    await queueProvider.enqueue('notifications', 'after_close', {});
    await vi.runAllTimersAsync();

    expect(oldHandler).toHaveBeenCalledTimes(1);
  });
});
