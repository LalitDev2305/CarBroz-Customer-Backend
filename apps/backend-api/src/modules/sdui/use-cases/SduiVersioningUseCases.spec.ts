import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateSduiDraftUseCase } from './CreateSduiDraftUseCase.js';
import { UpdateSduiDraftUseCase } from './UpdateSduiDraftUseCase.js';
import { PublishSduiVersionUseCase } from './PublishSduiVersionUseCase.js';
import { RollbackSduiVersionUseCase } from './RollbackSduiVersionUseCase.js';
import { CompareSduiVersionsUseCase } from './CompareSduiVersionsUseCase.js';
import { SduiScreenEntity, ForbiddenError, NotFoundError } from '@carbroz/common';

describe('SDUI V3 Versioning UseCases', () => {
  let repository: any;
  const adminContext: any = { authenticatedUser: { id: 1, isAdmin: true } };
  const userContext: any = { authenticatedUser: { id: 2, isAdmin: false } };

  const validLayoutJson = {
    screenId: 'auth_login',
    templateId: 't1',
    templateType: 'auth',
    schemaVersion: '3.0.0',
    targetApp: 'CUSTOMER' as const,
    template: { id: 't1', type: 'auth', components: [] }
  };

  beforeEach(() => {
    repository = {
      createDraft: vi.fn(), updateDraft: vi.fn(), publishVersion: vi.fn(), archiveVersion: vi.fn(),
      rollbackVersion: vi.fn(), getVersionHistory: vi.fn(), getSpecificVersion: vi.fn(), findDraft: vi.fn()
    };
  });

  it('allows admin to create a canonical draft', async () => {
    const useCase = new CreateSduiDraftUseCase(repository);
    const mockDraft = new SduiScreenEntity({ id: 1, publicId: 'uuid-1', screenId: 'auth_login', targetApp: 'CUSTOMER', versionNumber: 2, status: 'DRAFT', layoutJson: validLayoutJson, lockVersion: 1, createdAt: new Date(), updatedAt: new Date() });
    repository.createDraft.mockResolvedValue(mockDraft);
    const result = await useCase.execute({ context: adminContext, data: { screenId: 'auth_login', targetApp: 'CUSTOMER', layoutJson: validLayoutJson, overwriteExistingDraft: false } });
    expect(result.versionNumber).toBe(2);
    expect(result.status).toBe('DRAFT');
    expect(repository.createDraft).toHaveBeenCalled();
  });

  it('rejects non-admin draft creation', async () => {
    const useCase = new CreateSduiDraftUseCase(repository);
    await expect(useCase.execute({ context: userContext, data: { screenId: 'auth_login', targetApp: 'CUSTOMER', layoutJson: validLayoutJson, overwriteExistingDraft: false } })).rejects.toThrow(ForbiddenError);
  });

  it('updates a canonical draft with optimistic lock version', async () => {
    const useCase = new UpdateSduiDraftUseCase(repository);
    const mockUpdated = new SduiScreenEntity({ id: 1, publicId: 'uuid-1', screenId: 'auth_login', targetApp: 'CUSTOMER', versionNumber: 2, status: 'DRAFT', layoutJson: validLayoutJson, lockVersion: 2, createdAt: new Date(), updatedAt: new Date() });
    repository.updateDraft.mockResolvedValue(mockUpdated);
    const result = await useCase.execute({ context: adminContext, data: { screenId: 'auth_login', targetApp: 'CUSTOMER', lockVersion: 1, layoutJson: validLayoutJson } });
    expect(result.lockVersion).toBe(2);
  });

  it('publishes the target version', async () => {
    const useCase = new PublishSduiVersionUseCase(repository);
    const mockPublished = new SduiScreenEntity({ id: 1, publicId: 'uuid-1', screenId: 'auth_login', targetApp: 'CUSTOMER', versionNumber: 2, status: 'PUBLISHED', layoutJson: validLayoutJson, lockVersion: 2, publishedAt: new Date(), publishedBy: 'user-1', createdAt: new Date(), updatedAt: new Date() });
    repository.publishVersion.mockResolvedValue(mockPublished);
    const result = await useCase.execute({ context: adminContext, data: { screenId: 'auth_login', targetApp: 'CUSTOMER', versionNumber: 2 } });
    expect(result.status).toBe('PUBLISHED');
    expect(repository.publishVersion).toHaveBeenCalledWith('auth_login', 'CUSTOMER', 2, 'user-1');
  });

  it('creates a new published version on rollback', async () => {
    const useCase = new RollbackSduiVersionUseCase(repository);
    const mockRollback = new SduiScreenEntity({ id: 10, publicId: 'uuid-10', screenId: 'auth_login', targetApp: 'CUSTOMER', versionNumber: 5, status: 'PUBLISHED', layoutJson: validLayoutJson, lockVersion: 1, createdFromVersion: 1, changeDescription: 'Rollback to version 1', createdAt: new Date(), updatedAt: new Date() });
    repository.rollbackVersion.mockResolvedValue(mockRollback);
    const result = await useCase.execute({ context: adminContext, data: { screenId: 'auth_login', targetApp: 'CUSTOMER', targetVersionNumber: 1 } });
    expect(result.versionNumber).toBe(5);
    expect(result.createdFromVersion).toBe(1);
  });

  it('compares canonical component counts', async () => {
    const useCase = new CompareSduiVersionsUseCase(repository);
    const v1Layout = { ...validLayoutJson, template: { ...validLayoutJson.template, components: [{ id: 'c1', type: 'layout', elements: [] }] } };
    const v2Layout = { ...validLayoutJson, template: { ...validLayoutJson.template, components: [{ id: 'c1', type: 'layout', elements: [] }, { id: 'c2', type: 'layout', elements: [] }] } };
    const mockV1 = new SduiScreenEntity({ id: 1, publicId: 'uuid-1', screenId: 'auth_login', targetApp: 'CUSTOMER', versionNumber: 1, status: 'ARCHIVED', layoutJson: v1Layout, lockVersion: 1, createdAt: new Date(), updatedAt: new Date() });
    const mockV2 = new SduiScreenEntity({ id: 2, publicId: 'uuid-2', screenId: 'auth_login', targetApp: 'CUSTOMER', versionNumber: 2, status: 'PUBLISHED', layoutJson: v2Layout, lockVersion: 1, createdAt: new Date(), updatedAt: new Date() });
    repository.getSpecificVersion.mockImplementation((_screenId: string, _targetApp: string, version: number) => Promise.resolve(version === 1 ? mockV1 : version === 2 ? mockV2 : null));
    const result = await useCase.execute({ screenId: 'auth_login', targetApp: 'CUSTOMER', sourceVersion: 1, targetVersion: 2 });
    expect(result.comparisonSummary.isIdentical).toBe(false);
    expect(result.comparisonSummary.componentsCountDelta).toBe(1);
  });

  it('throws when a compared version is missing', async () => {
    const useCase = new CompareSduiVersionsUseCase(repository);
    repository.getSpecificVersion.mockResolvedValue(null);
    await expect(useCase.execute({ screenId: 'auth_login', targetApp: 'CUSTOMER', sourceVersion: 1, targetVersion: 99 })).rejects.toThrow(NotFoundError);
  });
});
