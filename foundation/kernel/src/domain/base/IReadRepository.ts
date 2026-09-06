/** IReadRepository is an exported foundation/kernel contract/implementation; see the owning README for lifecycle and extension rules. */
export interface IReadRepository<TEntity, TId> {
  findById(id: TId): Promise<TEntity | null>;
  findAll(): Promise<TEntity[]>;
}
