/** IDomainEvent is an exported foundation/kernel contract/implementation; see the owning README for lifecycle and extension rules. */
export interface IDomainEvent {
  eventName: string;
  occurredOn: Date;
}
