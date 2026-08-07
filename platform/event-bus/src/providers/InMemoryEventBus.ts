import { DomainEvent } from '@carbroz/foundation-kernel';


export interface EventBus {
  publish(event: DomainEvent): Promise<void>;
  publishAll(events: DomainEvent[]): Promise<void>;
  subscribe(eventName: string, handler: (event: DomainEvent) => Promise<void>): void;
}

export class InMemoryEventBus implements EventBus {
  private handlers = new Map<string, Array<(event: DomainEvent) => Promise<void>>>();


  async publish(event: DomainEvent): Promise<void> {
    const eventName = event.eventName || event.constructor.name;
    const subscribers = this.handlers.get(eventName) || [];
    await Promise.all(subscribers.map((handler) => handler(event)));
  }

  async publishAll(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }

  subscribe(eventName: string, handler: (event: DomainEvent) => Promise<void>): void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }
    this.handlers.get(eventName)!.push(handler);
  }
}

