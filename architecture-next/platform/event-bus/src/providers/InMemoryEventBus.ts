import { IDomainEvent } from '@carbroz/common';

export interface EventBus {
  publish(event: IDomainEvent): Promise<void>;
  publishAll(events: IDomainEvent[]): Promise<void>;
  subscribe(eventName: string, handler: (event: IDomainEvent) => Promise<void>): void;
}

export class InMemoryEventBus implements EventBus {
  private handlers = new Map<string, Array<(event: IDomainEvent) => Promise<void>>>();

  async publish(event: IDomainEvent): Promise<void> {
    const eventName = event.eventName || event.constructor.name;
    const subscribers = this.handlers.get(eventName) || [];
    await Promise.all(subscribers.map((handler) => handler(event)));
  }

  async publishAll(events: IDomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }

  subscribe(eventName: string, handler: (event: IDomainEvent) => Promise<void>): void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }
    this.handlers.get(eventName)!.push(handler);
  }
}
