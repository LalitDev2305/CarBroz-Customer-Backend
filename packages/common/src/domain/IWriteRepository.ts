export interface IWriteRepository<TEntity, TId> {
  save(entity: TEntity): Promise<TEntity>;
  delete(id: TId): Promise<boolean>;
}
