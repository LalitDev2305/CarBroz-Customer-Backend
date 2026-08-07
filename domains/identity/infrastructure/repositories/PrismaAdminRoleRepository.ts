import { PrismaProvider } from '@carbroz/platform-database';
import { AdminUserRole } from '../../domain/AdminUserRole.js';

export class PrismaAdminRoleRepository {
  constructor(private readonly prismaProvider: PrismaProvider) {}

  private get prisma() {
    return this.prismaProvider.getClient();
  }


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
    return records.map(r => r.roleId);
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
