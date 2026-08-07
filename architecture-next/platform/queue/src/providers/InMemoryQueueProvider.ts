export interface QueueJobOptions {
  delay?: number;
  attempts?: number;
  backoff?: {
    type: 'fixed' | 'exponential';
    delay: number;
  };
  removeOnComplete?: boolean | number;
  removeOnFail?: boolean | number;
}

export interface QueueJob<T = unknown> {
  id: string;
  name: string;
  data: T;
  timestamp?: number;
}

export interface QueueProvider {
  enqueue<T>(queueName: string, jobName: string, data: T, options?: QueueJobOptions): Promise<QueueJob<T>>;
  process<T>(queueName: string, handler: (job: QueueJob<T>) => Promise<void>): void;
  close?(): Promise<void>;
}

export class InMemoryQueueProvider implements QueueProvider {
  private queues = new Map<string, Array<{ job: QueueJob<any>; options?: QueueJobOptions }>>();
  private handlers = new Map<string, (job: QueueJob<any>) => Promise<void>>();
  private jobCounter = 0;

  async enqueue<T>(queueName: string, jobName: string, data: T, options?: QueueJobOptions): Promise<QueueJob<T>> {
    const job: QueueJob<T> = {
      id: `job-${++this.jobCounter}`,
      name: jobName,
      data,
      timestamp: Date.now(),
    };

    if (!this.queues.has(queueName)) {
      this.queues.set(queueName, []);
    }

    const queueItem: { job: QueueJob<any>; options?: QueueJobOptions } = { job };
    if (options) {
      queueItem.options = options;
    }
    this.queues.get(queueName)!.push(queueItem);

    const handler = this.handlers.get(queueName);
    if (handler) {
      setTimeout(() => {
        handler(job).catch(() => {});
      }, options?.delay || 0);
    }

    return job;
  }

  process<T>(queueName: string, handler: (job: QueueJob<T>) => Promise<void>): void {
    this.handlers.set(queueName, handler as any);
  }

  async close(): Promise<void> {
    this.queues.clear();
    this.handlers.clear();
  }
}
