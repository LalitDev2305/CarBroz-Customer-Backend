import { describe, expect, it, vi } from 'vitest';
import type { ExecutionContext } from '@carbroz/foundation-kernel';
import { ForbiddenError } from '@carbroz/foundation-kernel';
import {
  ArchiveSduiVersionUseCase,
  CreateSduiComponentUseCase,
  CreateSduiElementUseCase,
  CreateSduiGroupUseCase,
  CreateSduiSectionUseCase,
  RollbackSduiVersionUseCase,
  UpdateSduiDraftUseCase,
} from '../public/index.js';

const customerContext: ExecutionContext = {
  correlationId: 'registry-authorization-customer',
  timestamp: new Date('2026-01-01T00:00:00.000Z'),
  actor: { id: 42, kind: 'CUSTOMER', roles: ['CUSTOMER'], customerId: 42 },
};

const validLayoutJson = {
  screenId: 'auth_login', templateId: 't1', templateType: 'auth', schemaVersion: '3.0.0', targetApp: 'CUSTOMER' as const,
  template: { id: 't1', type: 'auth', components: [{ id: 'c1', type: 'layout', elements: [{ id: 'e1', type: 'text', properties: {} }] }] },
};

describe('SDUI Registry mutation authorization', () => {
  it('rejects non-admin update, archive and rollback mutations before repository side effects', async () => {
    const repository: any = { updateDraft: vi.fn(), archiveVersion: vi.fn(), rollbackVersion: vi.fn() };
    await expect(new UpdateSduiDraftUseCase(repository).execute({ context: customerContext, data: { screenId: 'auth_login', targetApp: 'CUSTOMER', lockVersion: 1, layoutJson: validLayoutJson } })).rejects.toThrow(ForbiddenError);
    await expect(new ArchiveSduiVersionUseCase(repository).execute({ context: customerContext, data: { screenId: 'auth_login', targetApp: 'CUSTOMER', versionNumber: 2 } })).rejects.toThrow(ForbiddenError);
    await expect(new RollbackSduiVersionUseCase(repository).execute({ context: customerContext, data: { screenId: 'auth_login', targetApp: 'CUSTOMER', targetVersionNumber: 1 } })).rejects.toThrow(ForbiddenError);
    expect(repository.updateDraft).not.toHaveBeenCalled();
    expect(repository.archiveVersion).not.toHaveBeenCalled();
    expect(repository.rollbackVersion).not.toHaveBeenCalled();
  });

  it('rejects every registry-node creation for non-admin actors before persistence', async () => {
    const repository: any = { createComponent: vi.fn(), createSection: vi.fn(), createGroup: vi.fn(), createElement: vi.fn() };
    const data = { name: 'node', componentType: 'layout', schemaJson: { type: 'object' } };
    await expect(new CreateSduiComponentUseCase(repository).execute({ context: customerContext, data })).rejects.toThrow(ForbiddenError);
    await expect(new CreateSduiSectionUseCase(repository).execute({ context: customerContext, data })).rejects.toThrow(ForbiddenError);
    await expect(new CreateSduiGroupUseCase(repository).execute({ context: customerContext, data })).rejects.toThrow(ForbiddenError);
    await expect(new CreateSduiElementUseCase(repository).execute({ context: customerContext, data })).rejects.toThrow(ForbiddenError);
    expect(repository.createComponent).not.toHaveBeenCalled();
    expect(repository.createSection).not.toHaveBeenCalled();
    expect(repository.createGroup).not.toHaveBeenCalled();
    expect(repository.createElement).not.toHaveBeenCalled();
  });
});
