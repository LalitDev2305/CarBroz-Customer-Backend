import { describe, expect, it, vi } from 'vitest';
import { type DomainEvent } from '@carbroz/foundation-kernel';
import { InMemoryEventBus } from '../src/providers/InMemoryEventBus.js';

function event(eventName: string): DomainEvent {
  return { eventName, occurredOn: new Date('2026-01-01T00:00:00.000Z') };
}

describe('InMemoryEventBus', () => {
  it('publishes an event to every subscriber registered for its name', async () => {
    const bus = new InMemoryEventBus();
    const first = vi.fn(async () => undefined);
    const second = vi.fn(async () => undefined);
    const payload = event('BookingCreated');

    bus.subscribe('BookingCreated', first);
    bus.subscribe('BookingCreated', second);
    await bus.publish(payload);

    expect(first).toHaveBeenCalledWith(payload);
    expect(second).toHaveBeenCalledWith(payload);
  });

  it('does nothing when an event has no subscribers', async () => {
    const bus = new InMemoryEventBus();
    await expect(bus.publish(event('UnknownEvent'))).resolves.toBeUndefined();
  });

  it('publishes event batches in order', async () => {
    const bus = new InMemoryEventBus();
    const received: string[] = [];

    bus.subscribe('First', async (payload) => {
      received.push(payload.eventName);
    });
    bus.subscribe('Second', async (payload) => {
      received.push(payload.eventName);
    });

    await bus.publishAll([event('First'), event('Second')]);
    expect(received).toEqual(['First', 'Second']);
  });
});
