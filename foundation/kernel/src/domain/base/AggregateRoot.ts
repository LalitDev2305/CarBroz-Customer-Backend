import { Entity } from './Entity.js';
import type { IDomainEvent } from './IDomainEvent.js';

/** AggregateRoot is an exported foundation/kernel contract/implementation; see the owning README for lifecycle and extension rules. */
export abstract class AggregateRoot<TId> extends Entity<TId> {
  private _domainEvents: IDomainEvent[] = [];

  get domainEvents(): readonly IDomainEvent[] {
    return [...this._domainEvents];
  }

  protected addDomainEvent(domainEvent: IDomainEvent): void {
    this._domainEvents.push(domainEvent);
  }

  clearEvents(): void {
    this._domainEvents = [];
  }
}
