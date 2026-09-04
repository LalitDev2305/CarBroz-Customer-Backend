import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ExecutionContext } from '@carbroz/foundation-kernel';
import { ForbiddenError, NotFoundError } from '@carbroz/foundation-kernel';
import {
  CompareSduiVersionsUseCase,
  CreateSduiDraftUseCase,
  PublishSduiVersionUseCase,
  RollbackSduiVersionUseCase,
  SduiScreenEntity,
  UpdateSduiDraftUseCase,
} from '../public/index.js';

describe('SDUI Registry application lifecycle', () => {
  let repository: any;
  const adminContext: ExecutionContext = {
    correlationId: 'test-admin',
    timestamp: new Date('2026-01-01T00:00:00.000Z'),
    actor: { id: 1, kind: 'ADMIN', roles: ['ADMIN'] },
  };
  const userContext: ExecutionContext = {
    correlationId: 'test-customer',
    timestamp: new Date('2026-01-01T00:00:00.000Z'),
    actor: { id: 2, kind: 'CUSTOMER', roles: ['CUSTOMER'], customerId: 2 },
  };

  const validLayoutJson = {
    screenId: 'auth_login',
    templateId: 't1',
    templateType: 'auth',
    schemaVersion: '3.0.0',
    targetApp: 'CUSTOMER' as const,
    template: { id: 't1', type: 'auth', components: [] },
  };

  beforeEach(() => {
    repository = {
      createDraft: vi.fn(),
      updateDraft: vi.fn(),
      publishVersion: vi.fn(),
      archiveVersion: vi.fn(),
      rollbackVersion: vi.fn(),
      getVersionHistory: vi.fn(),
      getSpecificVersion: vi.fn(),
      findDraft: vi.fn(),
    };
  });

  it('allows an admin to create a canonical draft', async () => {
    const useCase = new CreateSduiDraftUseCase(repository);
    repository.createDraft.mockResolvedValue(new SduiScreenEntity({
      id: 1,
      publicId: 'uuid-1',
      screenId: 'auth_login',
      targetApp: 'CUSTOMER',
      versionNumber: 2,
      status: 'DRAFT',
      layoutJson: validLayoutJson,
      lockVersion: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const result = await useCase.execute({
      context: adminContext,
      data: {
        screenId: 'auth_login',
        targetApp: 'CUSTOMER',
        layoutJson: validLayoutJson,
        overwriteExistingDraft: false,
      },
    });

    expect(result.versionNumber).toBe(2);
    expect(result.status).toBe('DRAFT');
    expect(repository.createDraft).toHaveBeenCalledTimes(1);
  });

  it('rejects non-admin draft creation without persistence side effects', async () => {
    const useCase = new CreateSduiDraftUseCase(repository);
    await expect(useCase.execute({
      context: userContext,
      data: {
        screenId: 'auth_login',
        targetApp: 'CUSTOMER',
        layoutJson: validLayoutJson,
        overwriteExistingDraft: false,
      },
    })).rejects.toThrow(ForbiddenError);
    expect(repository.createDraft).not.toHaveBeenCalled();
  });

  it('updates a canonical draft with optimistic lock version', async () => {
    const useCase = new UpdateSduiDraftUseCase(repository);
    repository.updateDraft.mockResolvedValue(new SduiScreenEntity({
      id: 1,
      publicId: 'uuid-1',
      screenId: 'auth_login',
      targetApp: 'CUSTOMER',
      versionNumber: 2,
      status: 'DRAFT',
      layoutJson: validLayoutJson,
      lockVersion: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const result = await useCase.execute({
      context: adminContext,
      data: {
        screenId: 'auth_login',
        targetApp: 'CUSTOMER',
        lockVersion: 1,
        layoutJson: validLayoutJson,
      },
    });
    expect(result.lockVersion).toBe(2);
  });

  it('publishes with the canonical actor identity', async () => {
    const useCase = new PublishSduiVersionUseCase(repository);
    repository.publishVersion.mockResolvedValue(new SduiScreenEntity({
      id: 1,
      publicId: 'uuid-1',
      screenId: 'auth_login',
      targetApp: 'CUSTOMER',
      versionNumber: 2,
      status: 'PUBLISHED',
      layoutJson: validLayoutJson,
      lockVersion: 2,
      publishedAt: new Date(),
      publishedBy: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await useCase.execute({
      context: adminContext,
      data: { screenId: 'auth_login', targetApp: 'CUSTOMER', versionNumber: 2 },
    });
    expect(repository.publishVersion).toHaveBeenCalledWith('auth_login', 'CUSTOMER', 2, 'user-1');
  });

  it('creates a new published version on rollback', async () => {
    const useCase = new RollbackSduiVersionUseCase(repository);
    repository.rollbackVersion.mockResolvedValue(new SduiScreenEntity({
      id: 10,
      publicId: 'uuid-10',
      screenId: 'auth_login',
      targetApp: 'CUSTOMER',
      versionNumber: 5,
      status: 'PUBLISHED',
      layoutJson: validLayoutJson,
      lockVersion: 1,
      createdFromVersion: 1,
      changeDescription: 'Rollback to version 1',
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const result = await useCase.execute({
      context: adminContext,
      data: { screenId: 'auth_login', targetApp: 'CUSTOMER', targetVersionNumber: 1 },
    });
    expect(result.versionNumber).toBe(5);
    expect(result.createdFromVersion).toBe(1);
  });

  it('compares canonical hierarchy counts', async () => {
    const useCase = new CompareSduiVersionsUseCase(repository);
    const v1Layout = {
      ...validLayoutJson,
      template: { ...validLayoutJson.template, components: [{ id: 'c1', type: 'layout', elements: [] }] },
    };
    const v2Layout = {
      ...validLayoutJson,
      template: {
        ...validLayoutJson.template,
        components: [
          { id: 'c1', type: 'layout', elements: [] },
          { id: 'c2', type: 'layout', elements: [] },
        ],
      },
    };
    const v1 = new SduiScreenEntity({
      id: 1,
      publicId: 'uuid-1',
      screenId: 'auth_login',
      targetApp: 'CUSTOMER',
      versionNumber: 1,
      status: 'ARCHIVED',
      layoutJson: v1Layout,
      lockVersion: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const v2 = new SduiScreenEntity({
      id: 2,
      publicId: 'uuid-2',
      screenId: 'auth_login',
      targetApp: 'CUSTOMER',
      versionNumber: 2,
      status: 'PUBLISHED',
      layoutJson: v2Layout,
      lockVersion: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    repository.getSpecificVersion.mockImplementation((_screenId: string, _targetApp: string, version: number) =>
      Promise.resolve(version === 1 ? v1 : version === 2 ? v2 : null));

    const result = await useCase.execute({
      screenId: 'auth_login',
      targetApp: 'CUSTOMER',
      sourceVersion: 1,
      targetVersion: 2,
    });
    expect(result.comparisonSummary.isIdentical).toBe(false);
    expect(result.comparisonSummary.componentsCountDelta).toBe(1);
  });

  it('throws when a compared version is missing', async () => {
    const useCase = new CompareSduiVersionsUseCase(repository);
    repository.getSpecificVersion.mockResolvedValue(null);
    await expect(useCase.execute({
      screenId: 'auth_login',
      targetApp: 'CUSTOMER',
      sourceVersion: 1,
      targetVersion: 99,
    })).rejects.toThrow(NotFoundError);
  });
});
