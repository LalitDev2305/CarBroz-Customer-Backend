import { PrismaClient } from '@prisma/client';
import { IConfigRepository, SystemConfig } from '@carbroz/common';

export class PrismaConfigRepository implements IConfigRepository {
  private unitOfWorkPrisma: any = null;

  constructor(private readonly prismaClient: PrismaClient) {}

  private get prisma(): any {
    return this.unitOfWorkPrisma || this.prismaClient;
  }

  private mapToDomain(model: any): SystemConfig {
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

  public async findById(id: number): Promise<SystemConfig | null> {
    const model = await this.prisma.systemConfig.findUnique({ where: { id } });
    return model ? this.mapToDomain(model) : null;
  }

  public async findAll(): Promise<SystemConfig[]> {
    const models = await this.prisma.systemConfig.findMany({ where: { deletedAt: null } });
    return models.map((m: any) => this.mapToDomain(m));
  }

  public async save(entity: SystemConfig): Promise<SystemConfig> {
    const model = await this.prisma.systemConfig.upsert({
      where: { id: entity.id || 0 },
      create: {
        publicId: entity.publicId,
        key: entity.key,
        value: entity.value,
        description: entity.description,
      },
      update: {
        key: entity.key,
        value: entity.value,
        description: entity.description,
      },
    });
    return this.mapToDomain(model);
  }

  public async delete(id: number): Promise<boolean> {
    await this.prisma.systemConfig.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return true;
  }

  public async findByKey(key: string): Promise<SystemConfig | null> {
    const model = await this.prisma.systemConfig.findFirst({
      where: { key, deletedAt: null },
    });
    return model ? this.mapToDomain(model) : null;
  }

  public async findAllConfig(): Promise<SystemConfig[]> {
    const models = await this.prisma.systemConfig.findMany({
      where: { deletedAt: null },
    });
    return models.map((m: any) => this.mapToDomain(m));
  }
}
