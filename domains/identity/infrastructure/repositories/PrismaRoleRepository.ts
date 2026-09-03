import { type IRoleRepository } from '../../domain/repositories/IRoleRepository.js';
import { type Role } from '../../domain/Role.js';
import { PrismaClient } from '@prisma/client';

export class PrismaRoleRepository implements IRoleRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: number): Promise<Role | null> {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) return null;
    return this.mapToDomain(role);
  }

  async findAll(): Promise<Role[]> {
    const roles = await this.prisma.role.findMany();
    return roles.map(this.mapToDomain);
  }

  async findByName(name: string): Promise<Role | null> {
    const role = await this.prisma.role.findUnique({ where: { name } });
    if (!role) return null;
    return this.mapToDomain(role);
  }

  async findWithPermissions(roleId: number): Promise<Role & { permissions: number[] } | null> {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
      include: { permissions: true }
    });
    if (!role) return null;
    return {
      ...this.mapToDomain(role),
      permissions: role.permissions.map((p: { permissionId: number }) => p.permissionId)
    };
  }

  async save(entity: Role): Promise<Role> {
    const data = {
      name: entity.name,
      description: entity.description,
      isSystem: entity.isSystem
    };

    let role;
    if (entity.id) {
      role = await this.prisma.role.update({
        where: { id: entity.id },
        data
      });
    } else {
      role = await this.prisma.role.create({
        data: {
          ...data,
          publicId: entity.publicId
        }
      });
    }
    return this.mapToDomain(role);
  }

  async delete(id: number): Promise<boolean> {
    await this.prisma.role.delete({ where: { id } });
    return true;
  }

  private mapToDomain(role: any): Role {
    return {
      id: role.id,
      publicId: role.publicId,
      name: role.name,
      description: role.description,
      isSystem: role.isSystem,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
      deletedAt: role.deletedAt
    };
  }
}
