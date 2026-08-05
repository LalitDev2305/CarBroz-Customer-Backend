import { Entity } from './Entity.js';
export class AggregateRoot extends Entity {
    _domainEvents = [];
    get domainEvents() {
        return [...this._domainEvents];
    }
    addDomainEvent(domainEvent) {
        this._domainEvents.push(domainEvent);
    }
    clearEvents() {
        this._domainEvents = [];
    }
}
//# sourceMappingURL=AggregateRoot.js.map