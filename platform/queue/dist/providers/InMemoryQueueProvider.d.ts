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
export declare class InMemoryQueueProvider implements QueueProvider {
    private queues;
    private handlers;
    private jobCounter;
    enqueue<T>(queueName: string, jobName: string, data: T, options?: QueueJobOptions): Promise<QueueJob<T>>;
    process<T>(queueName: string, handler: (job: QueueJob<T>) => Promise<void>): void;
    close(): Promise<void>;
}
