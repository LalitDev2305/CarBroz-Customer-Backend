import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryQueueProvider } from '../src/providers/InMemoryQueueProvider.js';

describe('InMemoryQueueProvider', () => {
  let queueProvider: InMemoryQueueProvider;

  beforeEach(() => {
    queueProvider = new InMemoryQueueProvider();
  });

  it('should enqueue a job and return job details', async () => {
    const job = await queueProvider.enqueue('notifications', 'send_email', { to: 'test@carbroz.com' });
    expect(job).toBeDefined();
    expect(job.id).toContain('job-');
    expect(job.name).toBe('send_email');
    expect(job.data).toEqual({ to: 'test@carbroz.com' });
  });

  it('should process enqueued jobs', async () => {
    let processedData: any = null;

    queueProvider.process('notifications', async (job) => {
      processedData = job.data;
    });

    await queueProvider.enqueue('notifications', 'send_email', { payload: 'hello' });

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(processedData).toEqual({ payload: 'hello' });
  });
});
