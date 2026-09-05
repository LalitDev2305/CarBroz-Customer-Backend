import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ExecutionContext } from '@carbroz/foundation-kernel';
import { ForbiddenError, NotFoundError } from '@carbroz/foundation-kernel';
import {
  ArchiveSduiVersionUseCase,
  CompareSduiVersionsUseCase,
  CreateSduiComponentUseCase,
  CreateSduiDraftUseCase,
  CreateSduiElementUseCase,
  CreateSduiGroupUseCase,
  CreateSduiSectionUseCase,
  GetSduiScreenUseCase,
  GetSduiSpecificVersionUseCase,
  GetSduiVersionHistoryUseCase,
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
  const roleAdminContext: ExecutionContext = {
    correlationId: 'test-role-admin',
    timestamp: new Date('2026-01-01T00:00:00.000Z'),
    actor: { id: 3, kind: 'CUSTOMER', roles: ['ADMIN'], customerId: 3 },
  };
  const userContext: ExecutionContext = {
    correlationId: 'test-customer',
    timestamp: new Date('2026-01-01T00:00:00.000Z'),
    actor: { id: 2, kind: 'CUSTOMER', roles: ['CUSTOMER'], customerId: 2 },
  };
  const anonymousContext: ExecutionContext = {
    correlationId: 'test-anonymous',
    timestamp: new Date('2026-01-01T00:00:00.000Z'),
    actor: undefined,
  };

  const validLayoutJson = {
    screenId: 'auth_login',
    templateId: 't1',
    templateType: 'auth',
    schemaVersion: '3.0.0',
    targetApp: 'CUSTOMER' as const,
    template: { id: 't1', type: 'auth', components: [] },
  };

  const screen = (overrides: Record<string, unknown> = {}) => new SduiScreenEntity({
    id: 1,
    publicId: 'uuid-1',
    screenId: 'auth_login',
    targetApp: 'CUSTOMER',
    versionNumber: 2,
    status: 'DRAFT',
    layoutJson: validLayoutJson,
    lockVersion: 1,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  });

  beforeEach(() => {
    repository = {
      createComponent: vi.fn(),
      createSection: vi.fn(),
      createGroup: vi.fn(),
      createElement: vi.fn(),
      createDraft: vi.fn(),
      updateDraft: vi.fn(),
      publishVersion: vi.fn(),
      archiveVersion: vi.fn(),
      rollbackVersion: vi.fn(),
      getVersionHistory: vi.fn(),
      getSpecificVersion: vi.fn(),
      findPublishedScreen: vi.fn(),
      findDraft: vi.fn(),
    };
  });

  it('allows an admin to create a canonical draft', async () => {
    const useCase = new CreateSduiDraftUseCase(repository);
    repository.createDraft.mockResolvedValue(screen({ versionNumber: 2 }));

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

  it('accepts an ADMIN role even when actor kind is not ADMIN', async () => {
    const useCase = new CreateSduiDraftUseCase(repository);
    repository.createDraft.mockResolvedValue(screen());
    await useCase.execute({
      context: roleAdminContext,
      data: { screenId: 'auth_login', layoutJson: validLayoutJson },
    });
    expect(repository.createDraft).toHaveBeenCalledTimes(1);
  });

  it('rejects non-admin and anonymous draft creation without persistence side effects', async () => {
    const useCase = new CreateSduiDraftUseCase(repository);
    const data = {
      screenId: 'auth_login',
      targetApp: 'CUSTOMER' as const,
      layoutJson: validLayoutJson,
      overwriteExistingDraft: false,
    };
    await expect(useCase.execute({ context: userContext, data })).rejects.toThrow(ForbiddenError);
    await expect(useCase.execute({ context: anonymousContext, data })).rejects.toThrow(ForbiddenError);
    expect(repository.createDraft).not.toHaveBeenCalled();
  });

  it('creates all registry node types through their canonical repository operations', async () => {
    const data = {
      name: 'node',
      componentType: 'layout',
      schemaJson: { type: 'object' },
      supportedProperties: ['padding'],
      supportedActions: ['tap'],
    };
    const component = { id: 1, name: 'component' };
    const section = { id: 2, name: 'section' };
    const group = { id: 3, name: 'group' };
    const element = { id: 4, name: 'element' };
    repository.createComponent.mockResolvedValue(component);
    repository.createSection.mockResolvedValue(section);
    repository.createGroup.mockResolvedValue(group);
    repository.createElement.mockResolvedValue(element);

    await expect(new CreateSduiComponentUseCase(repository).execute({ context: adminContext, data })).resolves.toBe(component);
    await expect(new CreateSduiSectionUseCase(repository).execute({ context: adminContext, data })).resolves.toBe(section);
    await expect(new CreateSduiGroupUseCase(repository).execute({ context: adminContext, data })).resolves.toBe(group);
    await expect(new CreateSduiElementUseCase(repository).execute({ context: adminContext, data })).resolves.toBe(element);

    expect(repository.createComponent).toHaveBeenCalledWith(data);
    expect(repository.createSection).toHaveBeenCalledWith(data);
    expect(repository.createGroup).toHaveBeenCalledWith(data);
    expect(repository.createElement).toHaveBeenCalledWith(data);
  });

  it('updates a canonical draft with optimistic lock version', async () => {
    const useCase = new UpdateSduiDraftUseCase(repository);
    repository.updateDraft.mockResolvedValue(screen({ lockVersion: 2 }));

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

  it('publishes with the canonical actor identity and CUSTOMER default target', async () => {
    const useCase = new PublishSduiVersionUseCase(repository);
    repository.publishVersion.mockResolvedValue(screen({
      status: 'PUBLISHED',
      publishedAt: new Date('2026-01-01T00:00:00.000Z'),
      publishedBy: 'user-1',
    }));

    await useCase.execute({
      context: adminContext,
      data: { screenId: 'auth_login', versionNumber: 2 },
    });
    expect(repository.publishVersion).toHaveBeenCalledWith('auth_login', 'CUSTOMER', 2, 'user-1');
  });

  it('rejects publishing when no authenticated administrator exists', async () => {
    const useCase = new PublishSduiVersionUseCase(repository);
    await expect(useCase.execute({
      context: anonymousContext,
      data: { screenId: 'auth_login', versionNumber: 2 },
    })).rejects.toThrow(ForbiddenError);
    expect(repository.publishVersion).not.toHaveBeenCalled();
  });

  it('archives a version with CUSTOMER as the default target', async () => {
    const useCase = new ArchiveSduiVersionUseCase(repository);
    repository.archiveVersion.mockResolvedValue(screen({ status: 'ARCHIVED' }));
    const result = await useCase.execute({
      context: adminContext,
      data: { screenId: 'auth_login', versionNumber: 2 },
    });
    expect(result.status).toBe('ARCHIVED');
    expect(repository.archiveVersion).toHaveBeenCalledWith('auth_login', 'CUSTOMER', 2);
  });

  it('creates a new published version on rollback and applies the default target', async () => {
    const useCase = new RollbackSduiVersionUseCase(repository);
    repository.rollbackVersion.mockResolvedValue(screen({
      id: 10,
      publicId: 'uuid-10',
      versionNumber: 5,
      status: 'PUBLISHED',
      createdFromVersion: 1,
      changeDescription: 'Rollback to version 1',
    }));

    const result = await useCase.execute({
      context: adminContext,
      data: { screenId: 'auth_login', targetVersionNumber: 1 },
    });
    expect(result.versionNumber).toBe(5);
    expect(result.createdFromVersion).toBe(1);
    expect(repository.rollbackVersion).toHaveBeenCalledWith('auth_login', 'CUSTOMER', 1, 'user-1');
  });

  it('returns version history without inventing a target-app default', async () => {
    const useCase = new GetSduiVersionHistoryUseCase(repository);
    repository.getVersionHistory.mockResolvedValue([screen()]);
    await expect(useCase.execute({ screenId: 'auth_login' })).resolves.toHaveLength(1);
    expect(repository.getVersionHistory).toHaveBeenCalledWith('auth_login', undefined);
  });

  it('returns a specific version and defaults its target to CUSTOMER', async () => {
    const useCase = new GetSduiSpecificVersionUseCase(repository);
    repository.getSpecificVersion.mockResolvedValue(screen());
    const result = await useCase.execute({ screenId: 'auth_login', versionNumber: 2 });
    expect(result.versionNumber).toBe(2);
    expect(repository.getSpecificVersion).toHaveBeenCalledWith('auth_login', 'CUSTOMER', 2);
  });

  it('throws when a requested specific version does not exist', async () => {
    const useCase = new GetSduiSpecificVersionUseCase(repository);
    repository.getSpecificVersion.mockResolvedValue(null);
    await expect(useCase.execute({ screenId: 'auth_login', versionNumber: 404 })).rejects.toThrow(NotFoundError);
  });

  it('compares canonical hierarchy counts', async () => {
    const useCase = new CompareSduiVersionsUseCase(repository);
    const v1Layout = {
      ...validLayoutJson,
      template: {
        ...validLayoutJson.template,
        components: [
          { id: 'c1', type: 'layout', elements: [{ id: 'e1', type: 'text', properties: {} }] },
        ],
      },
    };
    const v2Layout = {
      ...validLayoutJson,
      template: {
        ...validLayoutJson.template,
        components: [
          { id: 'c1', type: 'layout', elements: [{ id: 'e1', type: 'text', properties: {} }] },
          { id: 'c2', type: 'layout', elements: [{ id: 'e2', type: 'text', properties: {} }] },
        ],
      },
    };
    const v1 = screen({ versionNumber: 1, status: 'ARCHIVED', layoutJson: v1Layout });
    const v2 = screen({ id: 2, publicId: 'uuid-2', versionNumber: 2, status: 'PUBLISHED', layoutJson: v2Layout });
    repository.getSpecificVersion.mockImplementation((_screenId: string, _targetApp: string, version: number) =>
      Promise.resolve(version === 1 ? v1 : version === 2 ? v2 : null));

    const result = await useCase.execute({
      screenId: 'auth_login',
      targetApp: 'CUSTOMER',
      sourceVersion: 1,
      targetVersion: 2,
    });
    expect(result.comparisonSummary.isIdentical).toBe(false);
    expect(result.comparisonSummary.templateTypeChanged).toBe(false);
    expect(result.comparisonSummary.componentsCountDelta).toBe(1);
    expect(result.comparisonSummary.elementsCountDelta).toBe(1);
  });

  it('reports identical versions and defaults comparison target to CUSTOMER', async () => {
    const useCase = new CompareSduiVersionsUseCase(repository);
    const v1 = screen({ versionNumber: 1, status: 'ARCHIVED' });
    const v2 = screen({ id: 2, publicId: 'uuid-2', versionNumber: 2, status: 'PUBLISHED' });
    repository.getSpecificVersion.mockImplementation((_screenId: string, targetApp: string, version: number) => {
      expect(targetApp).toBe('CUSTOMER');
      return Promise.resolve(version === 1 ? v1 : v2);
    });

    const result = await useCase.execute({
      screenId: 'auth_login',
      sourceVersion: 1,
      targetVersion: 2,
    });
    expect(result.comparisonSummary.isIdentical).toBe(true);
    expect(result.comparisonSummary.componentsCountDelta).toBe(0);
    expect(result.comparisonSummary.sectionsCountDelta).toBe(0);
    expect(result.comparisonSummary.groupsCountDelta).toBe(0);
    expect(result.comparisonSummary.elementsCountDelta).toBe(0);
  });

  it('throws when the source compared version is missing', async () => {
    const useCase = new CompareSduiVersionsUseCase(repository);
    repository.getSpecificVersion.mockResolvedValue(null);
    await expect(useCase.execute({
      screenId: 'auth_login',
      targetApp: 'CUSTOMER',
      sourceVersion: 1,
      targetVersion: 99,
    })).rejects.toThrow(NotFoundError);
    expect(repository.getSpecificVersion).toHaveBeenCalledTimes(1);
  });

  it('throws when the target compared version is missing', async () => {
    const useCase = new CompareSduiVersionsUseCase(repository);
    repository.getSpecificVersion
      .mockResolvedValueOnce(screen({ versionNumber: 1, status: 'ARCHIVED' }))
      .mockResolvedValueOnce(null);
    await expect(useCase.execute({
      screenId: 'auth_login',
      targetApp: 'CUSTOMER',
      sourceVersion: 1,
      targetVersion: 99,
    })).rejects.toThrow(NotFoundError);
    expect(repository.getSpecificVersion).toHaveBeenCalledTimes(2);
  });

  it('returns the parsed published screen contract', async () => {
    const useCase = new GetSduiScreenUseCase(repository);
    repository.findPublishedScreen.mockResolvedValue(screen({ status: 'PUBLISHED' }));
    const result = await useCase.execute({ data: { screenId: 'auth_login', targetApp: 'CUSTOMER' } });
    expect(result.screenId).toBe('auth_login');
    expect(result.targetApp).toBe('CUSTOMER');
    expect(repository.findPublishedScreen).toHaveBeenCalledWith('auth_login', 'CUSTOMER');
  });

  it('throws when no published screen exists for the requested target', async () => {
    const useCase = new GetSduiScreenUseCase(repository);
    repository.findPublishedScreen.mockResolvedValue(null);
    await expect(useCase.execute({
      data: { screenId: 'missing', targetApp: 'PARTNER' },
    })).rejects.toThrow(NotFoundError);
  });
});
