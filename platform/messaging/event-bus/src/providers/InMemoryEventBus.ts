import { type DomainEvent } from '@carbroz/foundation-kernel';

export interface EventBus {
  publish(event: DomainEvent): Promise<void>;
  publishAll(events: DomainEvent[]): Promise<void>;
  subscribe(eventName: string, handler: (event: DomainEvent) => Promise<void>): void;
}

export class InMemoryEventBus implements EventBus {
  private readonly handlers = new Map<string, Array<(event: DomainEvent) => Promise<void>>>();

  async publish(event: DomainEvent): Promise<void> {
    const subscribers = this.handlers.get(event.eventName) ?? [];
    await Promise.all(subscribers.map((handler) => handler(event)));
  }

  async publishAll(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }

  subscribe(eventName: string, handler: (event: DomainEvent) => Promise<void>): void {
    const subscribers = this.handlers.get(eventName) ?? [];
    subscribers.push(handler);
    this.handlers.set(eventName, subscribers);
  }
}
