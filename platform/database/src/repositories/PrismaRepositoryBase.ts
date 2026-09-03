import { type IRepository } from '@carbroz/foundation-kernel';
import { PrismaProvider } from '../providers/PrismaProvider.js';

export interface IPrismaDelegate<TModel, TFindManyArgs, TFindUniqueArgs, TCreateArgs, TUpdateArgs> {
  findUnique(args: TFindUniqueArgs): Promise<TModel | null>;
  findMany(args?: TFindManyArgs): Promise<TModel[]>;
  create(args: TCreateArgs): Promise<TModel>;
  update(args: TUpdateArgs): Promise<TModel>;
}

export abstract class PrismaRepositoryBase<
  TEntity,
  TId,
  TModel,
  TFindManyArgs,
  TFindUniqueArgs,
  TCreateArgs,
  TUpdateArgs
> implements IRepository<TEntity, TId> {
  protected prismaProvider: PrismaProvider;
  protected delegate: IPrismaDelegate<TModel, TFindManyArgs, TFindUniqueArgs, TCreateArgs, TUpdateArgs>;

  constructor(
    prismaProvider: PrismaProvider,
    delegate: IPrismaDelegate<TModel, TFindManyArgs, TFindUniqueArgs, TCreateArgs, TUpdateArgs>
  ) {
    this.prismaProvider = prismaProvider;
    this.delegate = delegate;
  }

  protected abstract mapToDomain(model: TModel): TEntity;
  protected abstract mapToModel(entity: TEntity): TModel;
  protected abstract getId(entity: TEntity): TId;
  protected abstract buildFindUniqueArgs(id: TId): TFindUniqueArgs;
  protected abstract buildCreateArgs(model: TModel): TCreateArgs;
  protected abstract buildUpdateArgs(model: TModel): TUpdateArgs;
  protected abstract buildSoftDeleteArgs(id: TId): TUpdateArgs;
  protected abstract buildExistsArgs(id: TId): TFindUniqueArgs;

  public async findById(id: TId): Promise<TEntity | null> {
    const record = await this.delegate.findUnique(this.buildFindUniqueArgs(id));
    return record ? this.mapToDomain(record) : null;
  }

  public async findAll(): Promise<TEntity[]> {
    const records = await this.delegate.findMany();
    return records.map(this.mapToDomain.bind(this));
  }

  public async findMany(params?: TFindManyArgs): Promise<TEntity[]> {
    const records = await this.delegate.findMany(params);
    return records.map(this.mapToDomain.bind(this));
  }

  public async create(entity: TEntity): Promise<TEntity> {
    const model = this.mapToModel(entity);
    const record = await this.delegate.create(this.buildCreateArgs(model));
    return this.mapToDomain(record);
  }

  public async update(entity: TEntity): Promise<TEntity> {
    const model = this.mapToModel(entity);
    const record = await this.delegate.update(this.buildUpdateArgs(model));
    return this.mapToDomain(record);
  }

  public async delete(id: TId): Promise<boolean> {
    const record = await this.delegate.update(this.buildSoftDeleteArgs(id));
    return !!record;
  }

  public async save(entity: TEntity): Promise<TEntity> {
    const id = this.getId(entity);
    if (id !== undefined && id !== null) {
      const exists = await this.exists(id);
      if (exists) {
        return this.update(entity);
      }
    }
    return this.create(entity);
  }

  public async exists(id: TId): Promise<boolean> {
    const record = await this.delegate.findUnique(this.buildExistsArgs(id));
    return !!record;
  }
}
