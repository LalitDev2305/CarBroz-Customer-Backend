import { Entity } from './Entity.js';
import type { IDomainEvent } from './IDomainEvent.js';
export declare abstract class AggregateRoot<TId> extends Entity<TId> {
    private _domainEvents;
    get domainEvents(): IDomainEvent[];
    protected addDomainEvent(domainEvent: IDomainEvent): void;
    clearEvents(): void;
}
//# sourceMappingURL=AggregateRoot.d.ts.map