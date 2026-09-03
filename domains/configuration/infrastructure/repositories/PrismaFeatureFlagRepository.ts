import { type FeatureFlag } from '../../domain/FeatureFlag.js';
import { type IFeatureFlagRepository } from '../../domain/repositories/IFeatureFlagRepository.js';
import { type FeatureFlagPersistenceProvider, type FeatureFlagPersistenceRecord } from '../persistence/FeatureFlagPersistenceClient.js';

export class PrismaFeatureFlagRepository implements IFeatureFlagRepository {
  constructor(private readonly prismaProvider: FeatureFlagPersistenceProvider) {}

  private get prisma() {
    return this.prismaProvider.getClient();
  }

  private mapToDomain(model: FeatureFlagPersistenceRecord): FeatureFlag {
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

  async findById(id: number): Promise<FeatureFlag | null> {
    const model = await this.prisma.featureFlag.findUnique({ where: { id } });
    return model ? this.mapToDomain(model) : null;
  }

  async findByKey(key: string): Promise<FeatureFlag | null> {
    const model = await this.prisma.featureFlag.findUnique({ where: { key, deletedAt: null } });
    return model ? this.mapToDomain(model) : null;
  }

  async findAll(): Promise<FeatureFlag[]> {
    const models = await this.prisma.featureFlag.findMany({ where: { deletedAt: null } });
    return models.map((model: any) => this.mapToDomain(model));
  }

  async findAllFlags(): Promise<FeatureFlag[]> {
    return this.findAll();
  }

  async save(entity: FeatureFlag): Promise<FeatureFlag> {
    const model = await this.prisma.featureFlag.update({
      where: { id: entity.id },
      data: {
        key: entity.key,
        enabled: entity.enabled,
        description: entity.description ?? null,
        deletedAt: entity.deletedAt ?? null,
      },
    });
    return this.mapToDomain(model);
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.featureFlag.update({ where: { id }, data: { deletedAt: new Date() } });
      return true;
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025') return false;
      throw error;
    }
  }
}
