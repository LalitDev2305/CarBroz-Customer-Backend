import { PrismaRepositoryBase } from './PrismaRepositoryBase.js';
import { IConfigRepository, SystemConfig } from '@carbroz/common';

export class PrismaConfigRepository
  extends PrismaRepositoryBase<SystemConfig, number, any, any, any, any, any>
  implements IConfigRepository
{
  constructor(prismaProvider: import('../providers/PrismaProvider.js').PrismaProvider) {
    super(prismaProvider, prismaProvider.getClient().systemConfig);
  }

  protected mapToDomain(model: any): SystemConfig {
    return {
      id: model.id,
      publicId: model.publicId,
      key: model.key,
      value: model.value,
      description: model.description,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      deletedAt: model.deletedAt,
    };
  }

  protected mapToModel(entity: SystemConfig): any {
    return {
      id: entity.id,
      publicId: entity.publicId,
      key: entity.key,
      value: entity.value,
      description: entity.description,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
    };
  }

  protected getId(entity: SystemConfig): number {
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

  public async findByKey(key: string): Promise<SystemConfig | null> {
    const model = await this.delegate.findUnique({
      where: { key, deletedAt: null },
    });
    return model ? this.mapToDomain(model) : null;
  }

  public async findAllConfig(): Promise<SystemConfig[]> {
    const models = await this.delegate.findMany({
      where: { deletedAt: null },
    });
    return models.map((m: any) => this.mapToDomain(m));
  }
}
