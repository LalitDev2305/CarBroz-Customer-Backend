import type { PrismaClient } from '@prisma/client';
import type { User } from '../../domain/User.js';
import type { IUserRepository } from '../../domain/repositories/IUserRepository.js';

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: number): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id, deletedAt: null }
    });
    return user ? this.mapToDomain(user) : null;
  }

  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: { deletedAt: null }
    });
    return users.map(this.mapToDomain);
  }

  async create(data: Partial<User>): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        phoneNumber: data.phoneNumber,
        isGuest: data.isGuest ?? false,
        role: data.role ?? 'USER',
      }
    });
    return this.mapToDomain(user);
  }

  async update(id: number, data: Partial<User>): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        email: data.email,
        phoneNumber: data.phoneNumber,
        isGuest: data.isGuest,
        role: data.role,
      }
    });
    return this.mapToDomain(user);
  }

  async save(entity: User): Promise<User> {
    if (entity.id) {
      return this.update(entity.id, entity);
    }
    return this.create(entity);
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.user.update({
        where: { id },
        data: { deletedAt: new Date() }
      });
      return true;
    } catch {
      return false;
    }
  }

  async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { phoneNumber, deletedAt: null }
    });
    return user ? this.mapToDomain(user) : null;
  }

  async upsert(phoneNumber: string, data: Partial<User>): Promise<User> {
    const user = await this.prisma.user.upsert({
      where: { phoneNumber },
      update: {
        email: data.email,
        isGuest: data.isGuest,
        role: data.role,
      },
      create: {
        phoneNumber,
        email: data.email,
        isGuest: data.isGuest ?? false,
        role: data.role ?? 'USER',
      }
    });
    return this.mapToDomain(user);
  }

  private mapToDomain(prismaUser: any): User {
    return {
      id: prismaUser.id,
      publicId: prismaUser.publicId,
      email: prismaUser.email,
      phoneNumber: prismaUser.phoneNumber,
      isGuest: prismaUser.isGuest,
      role: prismaUser.role,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
      deletedAt: prismaUser.deletedAt,
    };
  }
}
