import { DomainEvent } from '@carbroz/foundation-kernel';
export interface EventBus {
    publish(event: DomainEvent): Promise<void>;
    publishAll(events: DomainEvent[]): Promise<void>;
    subscribe(eventName: string, handler: (event: DomainEvent) => Promise<void>): void;
}
export declare class InMemoryEventBus implements EventBus {
    private handlers;
    publish(event: DomainEvent): Promise<void>;
    publishAll(events: DomainEvent[]): Promise<void>;
    subscribe(eventName: string, handler: (event: DomainEvent) => Promise<void>): void;
}
