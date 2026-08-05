export interface IQueueJob<T = unknown> {
    id: string;
    name: string;
    data: T;
}
export interface IQueueProvider {
    enqueue<T>(queueName: string, jobName: string, data: T): Promise<IQueueJob<T>>;
    process<T>(queueName: string, handler: (job: IQueueJob<T>) => Promise<void>): void;
}
//# sourceMappingURL=index.d.ts.map