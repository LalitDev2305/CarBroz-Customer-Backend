import { IDomainEvent } from '@carbroz/common';
export interface EventBus {
    publish(event: IDomainEvent): Promise<void>;
    publishAll(events: IDomainEvent[]): Promise<void>;
    subscribe(eventName: string, handler: (event: IDomainEvent) => Promise<void>): void;
}
export declare class InMemoryEventBus implements EventBus {
    private handlers;
    publish(event: IDomainEvent): Promise<void>;
    publishAll(events: IDomainEvent[]): Promise<void>;
    subscribe(eventName: string, handler: (event: IDomainEvent) => Promise<void>): void;
}
//# sourceMappingURL=InMemoryEventBus.d.ts.map