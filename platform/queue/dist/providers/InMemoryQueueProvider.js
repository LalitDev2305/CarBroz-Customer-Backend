export class InMemoryQueueProvider {
    queues = new Map();
    handlers = new Map();
    jobCounter = 0;
    async enqueue(queueName, jobName, data, options) {
        const job = {
            id: `job-${++this.jobCounter}`,
            name: jobName,
            data,
            timestamp: Date.now(),
        };
        if (!this.queues.has(queueName)) {
            this.queues.set(queueName, []);
        }
        const queueItem = { job };
        if (options) {
            queueItem.options = options;
        }
        this.queues.get(queueName).push(queueItem);
        const handler = this.handlers.get(queueName);
        if (handler) {
            setTimeout(() => {
                handler(job).catch(() => { });
            }, options?.delay || 0);
        }
        return job;
    }
    process(queueName, handler) {
        this.handlers.set(queueName, handler);
    }
    async close() {
        this.queues.clear();
        this.handlers.clear();
    }
}
//# sourceMappingURL=InMemoryQueueProvider.js.map