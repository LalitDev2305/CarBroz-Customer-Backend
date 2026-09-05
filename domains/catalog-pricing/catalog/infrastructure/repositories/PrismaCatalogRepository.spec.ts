import { describe, expect, it, vi } from 'vitest';
import type { PrismaClient } from '@prisma/client';
import { ServiceCategory } from '../../domain/ServiceCategory.js';
import { PrismaCatalogRepository } from './PrismaCatalogRepository.js';

const categoryRecord = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  publicId: 'category_1',
  name: 'Exterior',
  slug: 'exterior',
  description: 'Exterior care',
  iconUrl: null,
  sortOrder: 1,
  isActive: true,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  deletedAt: null,
  ...overrides,
});

const addonRecord = (overrides: Record<string, unknown> = {}) => ({
  id: 3,
  publicId: 'addon_3',
  serviceId: 2,
  name: 'Tyre polish',
  description: null,
  price: 15000,
  isActive: true,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  deletedAt: null,
  ...overrides,
});

const serviceRecord = (overrides: Record<string, unknown> = {}) => ({
  id: 2,
  publicId: 'service_2',
  categoryId: 1,
  name: 'Basic wash',
  slug: 'basic-wash',
  description: 'Basic exterior wash',
  imageUrl: null,
  basePrice: 49900,
  estimatedDurationMinutes: 45,
  isActive: true,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  deletedAt: null,
  addons: [addonRecord()],
  ...overrides,
});

function fixture() {
  const serviceCategory = {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  };
  const service = { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn() };
  const serviceAddon = { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn() };
  const prisma = { serviceCategory, service, serviceAddon } as unknown as PrismaClient;
  return { repository: new PrismaCatalogRepository(prisma), serviceCategory, service, serviceAddon };
}

describe('PrismaCatalogRepository', () => {
  it('maps category reads and their not-found variants', async () => {
    const { repository, serviceCategory } = fixture();
    serviceCategory.findUnique
      .mockResolvedValueOnce(categoryRecord())
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(categoryRecord())
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(categoryRecord())
      .mockResolvedValueOnce(null);
    serviceCategory.findMany.mockResolvedValue([categoryRecord(), categoryRecord({ id: 2, publicId: 'category_2' })]);

    await expect(repository.findById(1)).resolves.toMatchObject({ id: 1 });
    await expect(repository.findById(999)).resolves.toBeNull();
    await expect(repository.findCategoryBySlug('exterior')).resolves.toMatchObject({ slug: 'exterior' });
    await expect(repository.findCategoryBySlug('missing')).resolves.toBeNull();
    await expect(repository.findCategoryByPublicId('category_1')).resolves.toMatchObject({ publicId: 'category_1' });
    await expect(repository.findCategoryByPublicId('missing')).resolves.toBeNull();
    await expect(repository.findAll()).resolves.toHaveLength(2);
    await expect(repository.findAllActiveCategories()).resolves.toHaveLength(2);
  });

  it('creates a new category with defaults and updates an existing category through save', async () => {
    const { repository, serviceCategory } = fixture();
    serviceCategory.create.mockResolvedValue(categoryRecord({ sortOrder: 0, isActive: true }));
    serviceCategory.update.mockResolvedValue(categoryRecord({ name: 'Exterior Pro' }));

    const created = await repository.save(new ServiceCategory({ name: 'Exterior', slug: 'exterior' }));
    expect(created).toMatchObject({ sortOrder: 0, isActive: true });
    expect(serviceCategory.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ sortOrder: 0, isActive: true }),
    }));

    const existing = new ServiceCategory(categoryRecord());
    existing.name = 'Exterior Pro';
    await expect(repository.save(existing)).resolves.toMatchObject({ name: 'Exterior Pro' });
    expect(serviceCategory.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 1 } }));
  });

  it('uses explicitly supplied category creation values', async () => {
    const { repository, serviceCategory } = fixture();
    serviceCategory.create.mockResolvedValue(categoryRecord({ sortOrder: 9, isActive: false }));

    await repository.createCategory({ name: 'Hidden', slug: 'hidden', sortOrder: 9, isActive: false });

    expect(serviceCategory.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ sortOrder: 9, isActive: false }),
    }));
  });

  it('returns true for a successful soft delete and false when persistence rejects it', async () => {
    const { repository, serviceCategory } = fixture();
    serviceCategory.update.mockResolvedValueOnce(categoryRecord({ deletedAt: new Date() })).mockRejectedValueOnce(new Error('missing'));

    await expect(repository.delete(1)).resolves.toBe(true);
    await expect(repository.delete(999)).resolves.toBe(false);
  });

  it('maps service reads, addons and not-found variants', async () => {
    const { repository, service, serviceAddon } = fixture();
    service.findMany.mockResolvedValue([serviceRecord()]);
    service.findUnique
      .mockResolvedValueOnce(serviceRecord())
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(serviceRecord())
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(serviceRecord())
      .mockResolvedValueOnce(null);
    serviceAddon.findMany.mockResolvedValue([addonRecord()]);
    serviceAddon.findUnique.mockResolvedValueOnce(addonRecord()).mockResolvedValueOnce(null);

    const services = await repository.findServicesByCategoryId(1);
    expect(services[0].addons?.[0]).toMatchObject({ name: 'Tyre polish' });
    await expect(repository.findServiceBySlug('basic-wash')).resolves.toMatchObject({ slug: 'basic-wash' });
    await expect(repository.findServiceBySlug('missing')).resolves.toBeNull();
    await expect(repository.findServiceByPublicId('service_2')).resolves.toMatchObject({ publicId: 'service_2' });
    await expect(repository.findServiceByPublicId('missing')).resolves.toBeNull();
    await expect(repository.findServiceById(2)).resolves.toMatchObject({ id: 2 });
    await expect(repository.findServiceById(999)).resolves.toBeNull();
    await expect(repository.findAddonsByServiceId(2)).resolves.toHaveLength(1);
    await expect(repository.findAddonsByIds([3])).resolves.toHaveLength(1);
    await expect(repository.findAddonById(3)).resolves.toMatchObject({ id: 3 });
    await expect(repository.findAddonById(999)).resolves.toBeNull();
  });

  it('creates services and addons with defaults and honors explicit values', async () => {
    const { repository, service, serviceAddon } = fixture();
    service.create
      .mockResolvedValueOnce(serviceRecord({ estimatedDurationMinutes: 60, isActive: true, addons: undefined }))
      .mockResolvedValueOnce(serviceRecord({ estimatedDurationMinutes: 90, isActive: false, addons: undefined }));
    serviceAddon.create
      .mockResolvedValueOnce(addonRecord({ isActive: true }))
      .mockResolvedValueOnce(addonRecord({ isActive: false }));

    await repository.createService({ categoryId: 1, name: 'Basic wash', slug: 'basic-wash', basePrice: 49900 });
    expect(service.create).toHaveBeenNthCalledWith(1, expect.objectContaining({
      data: expect.objectContaining({ estimatedDurationMinutes: 60, isActive: true }),
    }));
    await repository.createService({ categoryId: 1, name: 'Long wash', slug: 'long-wash', basePrice: 79900, estimatedDurationMinutes: 90, isActive: false });
    expect(service.create).toHaveBeenNthCalledWith(2, expect.objectContaining({
      data: expect.objectContaining({ estimatedDurationMinutes: 90, isActive: false }),
    }));

    await repository.createAddon({ serviceId: 2, name: 'Tyre polish', price: 15000 });
    expect(serviceAddon.create).toHaveBeenNthCalledWith(1, expect.objectContaining({ data: expect.objectContaining({ isActive: true }) }));
    await repository.createAddon({ serviceId: 2, name: 'Hidden addon', price: 10000, isActive: false });
    expect(serviceAddon.create).toHaveBeenNthCalledWith(2, expect.objectContaining({ data: expect.objectContaining({ isActive: false }) }));
  });

  it('updates categories and services without inventing unspecified values', async () => {
    const { repository, serviceCategory, service } = fixture();
    serviceCategory.update.mockResolvedValue(categoryRecord({ name: 'Renamed' }));
    service.update.mockResolvedValue(serviceRecord({ name: 'Premium wash', addons: undefined }));

    await expect(repository.updateCategory(1, { name: 'Renamed' })).resolves.toMatchObject({ name: 'Renamed' });
    await expect(repository.updateService(2, { name: 'Premium wash' })).resolves.toMatchObject({ name: 'Premium wash' });
    expect(service.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 2 } }));
  });
});
