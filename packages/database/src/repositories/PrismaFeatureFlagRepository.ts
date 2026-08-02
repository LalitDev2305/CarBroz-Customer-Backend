import { PrismaRepositoryBase } from './PrismaRepositoryBase.js';
import { IFeatureFlagRepository, FeatureFlag } from '@carbroz/common';

export class PrismaFeatureFlagRepository
  extends PrismaRepositoryBase<FeatureFlag, number, any, any, any, any, any>
  implements IFeatureFlagRepository
{
  constructor(prismaProvider: import('../providers/PrismaProvider.js').PrismaProvider) {
    super(prismaProvider, prismaProvider.getClient().featureFlag);
  }

  protected mapToDomain(model: any): FeatureFlag {
    return {
      id: model.id,
      publicId: model.publicId,
      key: model.key,
      enabled: model.enabled,
      description: model.description,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      deletedAt: model.deletedAt,
    };
  }

  protected mapToModel(entity: FeatureFlag): any {
    return {
      id: entity.id,
      publicId: entity.publicId,
      key: entity.key,
      enabled: entity.enabled,
      description: entity.description,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
    };
  }

  protected getId(entity: FeatureFlag): number {
    return entity.id;
  }

  protected buildFindUniqueArgs(id: number): any {
    return { where: { id } };
  }

  protected buildCreateArgs(model: any): any {
    return { data: model };
  }

  protected buildUpdateArgs(model: any): any {
    return {
      where: { id: model.id },
      data: model,
    };
  }

  protected buildSoftDeleteArgs(id: number): any {
    return {
      where: { id },
      data: { deletedAt: new Date() },
    };
  }

  protected buildExistsArgs(id: number): any {
    return {
      where: { id },
      select: { id: true },
    };
  }

  public async findByKey(key: string): Promise<FeatureFlag | null> {
    const model = await this.delegate.findUnique({
      where: { key, deletedAt: null },
    });
    return model ? this.mapToDomain(model) : null;
  }

  public async findAllFlags(): Promise<FeatureFlag[]> {
    const models = await this.delegate.findMany({
      where: { deletedAt: null },
    });
    return models.map((m: any) => this.mapToDomain(m));
  }
}
