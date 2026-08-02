import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PrismaRepositoryBase } from '../src/repositories/PrismaRepositoryBase.js';
import { PrismaProvider } from '../src/providers/PrismaProvider.js';

interface TestEntity {
  id: number;
  name: string;
}

class TestRepository extends PrismaRepositoryBase<
  TestEntity,
  number,
  any,
  any,
  any,
  any,
  any
> {
  protected mapToDomain(model: any): TestEntity {
    return { id: model.id, name: model.name };
  }
  protected mapToModel(entity: TestEntity): any {
    return { id: entity.id, name: entity.name };
  }
  protected getId(entity: TestEntity): number {
    return entity.id;
  }
  protected buildFindUniqueArgs(id: number): any {
    return { where: { id } };
  }
  protected buildCreateArgs(model: any): any {
    return { data: model };
  }
  protected buildUpdateArgs(model: any): any {
    return { where: { id: model.id }, data: model };
  }
  protected buildSoftDeleteArgs(id: number): any {
    return { where: { id }, data: { deletedAt: new Date() } };
  }
  protected buildExistsArgs(id: number): any {
    return { where: { id }, select: { id: true } };
  }
}

describe('PrismaRepositoryBase', () => {
  let repository: TestRepository;
  let mockDelegate: any;

  beforeEach(() => {
    mockDelegate = {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    };

    const prismaProvider = new PrismaProvider();
    repository = new TestRepository(prismaProvider, mockDelegate);
  });

  it('should findById', async () => {
    mockDelegate.findUnique.mockResolvedValueOnce({ id: 1, name: 'Test' });
    const result = await repository.findById(1);
    expect(result).toEqual({ id: 1, name: 'Test' });
    expect(mockDelegate.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('should return null if findById not found', async () => {
    mockDelegate.findUnique.mockResolvedValueOnce(null);
    const result = await repository.findById(1);
    expect(result).toBeNull();
  });

  it('should findAll', async () => {
    mockDelegate.findMany.mockResolvedValueOnce([{ id: 1, name: 'Test' }]);
    const result = await repository.findAll();
    expect(result).toEqual([{ id: 1, name: 'Test' }]);
    expect(mockDelegate.findMany).toHaveBeenCalled();
  });

  it('should create', async () => {
    mockDelegate.create.mockResolvedValueOnce({ id: 1, name: 'Test' });
    const result = await repository.create({ id: 1, name: 'Test' });
    expect(result).toEqual({ id: 1, name: 'Test' });
    expect(mockDelegate.create).toHaveBeenCalledWith({ data: { id: 1, name: 'Test' } });
  });

  it('should update', async () => {
    mockDelegate.update.mockResolvedValueOnce({ id: 1, name: 'Test' });
    const result = await repository.update({ id: 1, name: 'Test' });
    expect(result).toEqual({ id: 1, name: 'Test' });
    expect(mockDelegate.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { id: 1, name: 'Test' } });
  });

  it('should delete (soft delete)', async () => {
    mockDelegate.update.mockResolvedValueOnce({ id: 1, name: 'Test', deletedAt: new Date() });
    const result = await repository.delete(1);
    expect(result).toBe(true);
    expect(mockDelegate.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 1 } })
    );
  });

  it('should save (create if not exists)', async () => {
    mockDelegate.findUnique.mockResolvedValueOnce(null); // exists -> false
    mockDelegate.create.mockResolvedValueOnce({ id: 1, name: 'Test' });
    
    const result = await repository.save({ id: 1, name: 'Test' });
    expect(result).toEqual({ id: 1, name: 'Test' });
    expect(mockDelegate.create).toHaveBeenCalled();
  });

  it('should save (update if exists)', async () => {
    mockDelegate.findUnique.mockResolvedValueOnce({ id: 1 }); // exists -> true
    mockDelegate.update.mockResolvedValueOnce({ id: 1, name: 'Test' });
    
    const result = await repository.save({ id: 1, name: 'Test' });
    expect(result).toEqual({ id: 1, name: 'Test' });
    expect(mockDelegate.update).toHaveBeenCalled();
  });
});
