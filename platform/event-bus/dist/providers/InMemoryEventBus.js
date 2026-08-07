export class InMemoryEventBus {
    handlers = new Map();
    async publish(event) {
        const eventName = event.eventName || event.constructor.name;
        const subscribers = this.handlers.get(eventName) || [];
        await Promise.all(subscribers.map((handler) => handler(event)));
    }
    async publishAll(events) {
        for (const event of events) {
            await this.publish(event);
        }
    }
    subscribe(eventName, handler) {
        if (!this.handlers.has(eventName)) {
            this.handlers.set(eventName, []);
        }
        this.handlers.get(eventName).push(handler);
    }
}
//# sourceMappingURL=InMemoryEventBus.js.map