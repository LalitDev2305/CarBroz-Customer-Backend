import type { IPermissionRepository } from '../../domain/repositories/IPermissionRepository.js';
import type { Permission } from '../../domain/Permission.js';
import { PrismaClient } from '@prisma/client';

export class PrismaPermissionRepository implements IPermissionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: number): Promise<Permission | null> {
    const permission = await this.prisma.permission.findUnique({ where: { id } });
    if (!permission) return null;
    return this.mapToDomain(permission);
  }

  async findAll(): Promise<Permission[]> {
    const permissions = await this.prisma.permission.findMany();
    return permissions.map(this.mapToDomain);
  }

  async findByKey(key: string): Promise<Permission | null> {
    const permission = await this.prisma.permission.findUnique({ where: { key } });
    if (!permission) return null;
    return this.mapToDomain(permission);
  }

  async save(entity: Permission): Promise<Permission> {
    const data = {
      key: entity.key,
      module: entity.module,
      description: entity.description
    };

    let permission;
    if (entity.id) {
      permission = await this.prisma.permission.update({
        where: { id: entity.id },
        data
      });
    } else {
      permission = await this.prisma.permission.create({
        data: {
          ...data,
          publicId: entity.publicId
        }
      });
    }
    return this.mapToDomain(permission);
  }

  async delete(id: number): Promise<boolean> {
    await this.prisma.permission.delete({ where: { id } });
    return true;
  }

  private mapToDomain(permission: any): Permission {
    return {
      id: permission.id,
      publicId: permission.publicId,
      key: permission.key,
      module: permission.module,
      description: permission.description,
      createdAt: permission.createdAt,
      updatedAt: permission.updatedAt,
      deletedAt: permission.deletedAt
    };
  }
}
