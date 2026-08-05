import type { IDomainEvent } from '@carbroz/shared-kernel';
export interface IEventBus {
    publish(event: IDomainEvent): Promise<void>;
    publishAll(events: IDomainEvent[]): Promise<void>;
    subscribe(eventName: string, handler: (event: IDomainEvent) => Promise<void>): void;
}
//# sourceMappingURL=index.d.ts.map