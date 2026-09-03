import { type IAdminRoleRepository } from '../../domain/repositories/IAdminRoleRepository.js';
import { type AdminUserRole } from '../../domain/AdminUserRole.js';
import { PrismaClient } from '@prisma/client';

export class PrismaAdminRoleRepository implements IAdminRoleRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async assignRole(userId: number, roleId: number, assignedBy?: number): Promise<AdminUserRole> {
    const record = await this.prisma.adminUserRole.create({
      data: {
        userId,
        roleId,
        assignedBy
      }
    });
    return this.mapToDomain(record);
  }

  async removeRole(userId: number, roleId: number): Promise<boolean> {
    await this.prisma.adminUserRole.delete({
      where: {
        userId_roleId: {
          userId,
          roleId
        }
      }
    });
    return true;
  }

  async findRolesForUser(userId: number): Promise<number[]> {
    const records = await this.prisma.adminUserRole.findMany({
      where: { userId },
      select: { roleId: true }
    });
    return records.map((r: { roleId: number }) => r.roleId);
  }

  private mapToDomain(record: any): AdminUserRole {
    return {
      userId: record.userId,
      roleId: record.roleId,
      assignedBy: record.assignedBy,
      assignedAt: record.assignedAt
    };
  }
}
