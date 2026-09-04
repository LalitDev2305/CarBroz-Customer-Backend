import type { PrismaClient } from '@prisma/client';
import type { FeatureFlag } from '../../domain/FeatureFlag.js';
import type { IFeatureFlagRepository } from '../../domain/repositories/IFeatureFlagRepository.js';

export class PrismaFeatureFlagRepository implements IFeatureFlagRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private mapToDomain(model: any): FeatureFlag {
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
    const model = await this.prisma.featureFlag.findFirst({ where: { id, deletedAt: null } });
    return model ? this.mapToDomain(model) : null;
  }

  async findAll(): Promise<FeatureFlag[]> {
    return this.findAllFlags();
  }

  async findByKey(key: string): Promise<FeatureFlag | null> {
    const model = await this.prisma.featureFlag.findFirst({ where: { key, deletedAt: null } });
    return model ? this.mapToDomain(model) : null;
  }

  async findAllFlags(): Promise<FeatureFlag[]> {
    const models = await this.prisma.featureFlag.findMany({ where: { deletedAt: null } });
    return models.map((model) => this.mapToDomain(model));
  }

  async save(entity: FeatureFlag): Promise<FeatureFlag> {
    const model = entity.id
      ? await this.prisma.featureFlag.update({
          where: { id: entity.id },
          data: {
            key: entity.key,
            enabled: entity.enabled,
            description: entity.description,
            deletedAt: entity.deletedAt ?? null,
          },
        })
      : await this.prisma.featureFlag.create({
          data: {
            ...(entity.publicId ? { publicId: entity.publicId } : {}),
            key: entity.key,
            enabled: entity.enabled,
            description: entity.description,
          },
        });

    return this.mapToDomain(model);
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.featureFlag.update({ where: { id }, data: { deletedAt: new Date() } });
      return true;
    } catch {
      return false;
    }
  }
}
