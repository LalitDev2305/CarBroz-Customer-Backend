/** IEntity is an exported foundation/kernel contract/implementation; see the owning README for lifecycle and extension rules. */
export interface IEntity<TId> {
  id: TId;
  createdAt: Date;
  updatedAt: Date;
}
