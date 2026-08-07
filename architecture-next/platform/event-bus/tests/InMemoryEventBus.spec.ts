import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryEventBus } from '../src/providers/InMemoryEventBus.js';
interface IDomainEvent {
  eventId: string;
  eventName: string;
  occurredOn: Date;
}

class TestDomainEvent implements IDomainEvent {
  eventId = 'evt-1';
  eventName = 'TestDomainEvent';
  occurredOn = new Date();
}

describe('InMemoryEventBus', () => {
  let eventBus: InMemoryEventBus;

  beforeEach(() => {
    eventBus = new InMemoryEventBus();
  });

  it('should publish and receive domain events', async () => {
    let received = false;

    eventBus.subscribe('TestDomainEvent', async (evt) => {
      received = true;
      expect(evt.eventId).toBe('evt-1');
    });

    await eventBus.publish(new TestDomainEvent());
    expect(received).toBe(true);
  });

  it('should publish multiple events sequentially', async () => {
    let count = 0;

    eventBus.subscribe('TestDomainEvent', async () => {
      count++;
    });

    await eventBus.publishAll([new TestDomainEvent(), new TestDomainEvent()]);
    expect(count).toBe(2);
  });
});
