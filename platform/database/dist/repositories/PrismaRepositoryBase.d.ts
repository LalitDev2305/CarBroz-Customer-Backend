import { IRepository } from '@carbroz/foundation-kernel';
import { PrismaProvider } from '../providers/PrismaProvider.js';
export interface IPrismaDelegate<TModel, TFindManyArgs, TFindUniqueArgs, TCreateArgs, TUpdateArgs> {
    findUnique(args: TFindUniqueArgs): Promise<TModel | null>;
    findMany(args?: TFindManyArgs): Promise<TModel[]>;
    create(args: TCreateArgs): Promise<TModel>;
    update(args: TUpdateArgs): Promise<TModel>;
}
export declare abstract class PrismaRepositoryBase<TEntity, TId, TModel, TFindManyArgs, TFindUniqueArgs, TCreateArgs, TUpdateArgs> implements IRepository<TEntity, TId> {
    protected prismaProvider: PrismaProvider;
    protected delegate: IPrismaDelegate<TModel, TFindManyArgs, TFindUniqueArgs, TCreateArgs, TUpdateArgs>;
    constructor(prismaProvider: PrismaProvider, delegate: IPrismaDelegate<TModel, TFindManyArgs, TFindUniqueArgs, TCreateArgs, TUpdateArgs>);
    protected abstract mapToDomain(model: TModel): TEntity;
    protected abstract mapToModel(entity: TEntity): TModel;
    protected abstract getId(entity: TEntity): TId;
    protected abstract buildFindUniqueArgs(id: TId): TFindUniqueArgs;
    protected abstract buildCreateArgs(model: TModel): TCreateArgs;
    protected abstract buildUpdateArgs(model: TModel): TUpdateArgs;
    protected abstract buildSoftDeleteArgs(id: TId): TUpdateArgs;
    protected abstract buildExistsArgs(id: TId): TFindUniqueArgs;
    findById(id: TId): Promise<TEntity | null>;
    findAll(): Promise<TEntity[]>;
    findMany(params?: TFindManyArgs): Promise<TEntity[]>;
    create(entity: TEntity): Promise<TEntity>;
    update(entity: TEntity): Promise<TEntity>;
    delete(id: TId): Promise<boolean>;
    save(entity: TEntity): Promise<TEntity>;
    exists(id: TId): Promise<boolean>;
}
//# sourceMappingURL=PrismaRepositoryBase.d.ts.map