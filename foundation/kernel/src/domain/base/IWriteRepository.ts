/** IWriteRepository is an exported foundation/kernel contract/implementation; see the owning README for lifecycle and extension rules. */
export interface IWriteRepository<TEntity, TId> {
  save(entity: TEntity): Promise<TEntity>;
  delete(id: TId): Promise<boolean>;
}
