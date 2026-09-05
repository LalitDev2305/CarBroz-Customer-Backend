import { beforeEach, describe, expect, it, vi } from 'vitest';
import { KernelError, KernelErrorCode } from '@carbroz/foundation-kernel';
import { PrismaSduiRegistryRepository } from '../infrastructure/repositories/PrismaSduiRegistryRepository.js';

const now = new Date('2026-03-01T00:00:00.000Z');
const validLayout = {
  screenId: 'auth_login',
  templateId: 't1',
  templateType: 'auth',
  schemaVersion: '3.0.0',
  targetApp: 'CUSTOMER' as const,
  template: {
    id: 't1',
    type: 'auth',
    components: [
      {
        id: 'c1',
        type: 'layout',
        elements: [{ id: 'e1', type: 'text', properties: {} }],
      },
    ],
  },
};

function screenRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    publicId: 'screen-public-1',
    screenId: 'auth_login',
    targetApp: 'CUSTOMER',
    versionNumber: 1,
    status: 'DRAFT',
    layoutJson: validLayout,
    lockVersion: 1,
    publishedAt: null,
    publishedBy: null,
    createdFromVersion: null,
    changeDescription: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function nodeRecord(nodeLevel: string) {
  return {
    id: 10,
    publicId: `node-${nodeLevel.toLowerCase()}`,
    name: `test_${nodeLevel.toLowerCase()}`,
    nodeLevel,
    componentType: 'container',
    schemaJson: { type: 'object' },
    supportedProperties: { padding: true },
    supportedActions: { tap: true },
    version: 1,
    status: 'ACTIVE',
    createdAt: now,
    updatedAt: now,
  };
}

function createClient() {
  const client: any = {
    sduiScreen: {
      findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), updateMany: vi.fn(),
    },
    sduiTemplate: { findUnique: vi.fn(), upsert: vi.fn() },
    sduiComponentRegistry: { findFirst: vi.fn(), findMany: vi.fn(), upsert: vi.fn() },
  };
  client.$transaction = vi.fn(async (operation: (tx: any) => Promise<unknown>) => operation(client));
  return client;
}

function expectKernelError(error: unknown, code: KernelErrorCode, statusCode: number) {
  expect(error).toBeInstanceOf(KernelError);
  expect((error as KernelError).code).toBe(code);
  expect((error as KernelError).statusCode).toBe(statusCode);
}

describe('PrismaSduiRegistryRepository', () => {
  let client: ReturnType<typeof createClient>;
  let repository: PrismaSduiRegistryRepository;

  beforeEach(() => {
    client = createClient();
    repository = new PrismaSduiRegistryRepository(client);
  });

  it('maps published lookup and its null branch', async () => {
    client.sduiScreen.findFirst
      .mockResolvedValueOnce(screenRecord({ status: 'PUBLISHED', publishedAt: now, publishedBy: 'admin-1' }))
      .mockResolvedValueOnce(null);
    const published = await repository.findPublishedScreen('auth_login');
    expect(published?.status).toBe('PUBLISHED');
    expect(published?.publishedBy).toBe('admin-1');
    await expect(repository.findPublishedScreen('missing', 'PARTNER')).resolves.toBeNull();
  });

  it('rejects an unsupported persisted status while mapping', async () => {
    client.sduiScreen.findFirst.mockResolvedValue(screenRecord({ status: 'CORRUPT' }));
    let error: unknown;
    try { await repository.findPublishedScreen('auth_login'); } catch (caught) { error = caught; }
    expectKernelError(error, KernelErrorCode.INVALID_INPUT, 400);
  });

  it('publishes a new upsert version and archives the previous publication', async () => {
    client.sduiScreen.findFirst.mockResolvedValue(screenRecord({ versionNumber: 3, status: 'PUBLISHED' }));
    client.sduiScreen.create.mockImplementation(async ({ data }: any) => screenRecord({
      id: 4,
      versionNumber: data.versionNumber,
      status: data.status,
      layoutJson: data.layoutJson,
      lockVersion: data.lockVersion,
      publishedAt: data.publishedAt,
      publishedBy: data.publishedBy,
      createdFromVersion: data.createdFromVersion,
      changeDescription: data.changeDescription,
    }));
    const result = await repository.upsertScreen('auth_login', 'CUSTOMER', validLayout, true);
    expect(result.versionNumber).toBe(4);
    expect(result.status).toBe('PUBLISHED');
    expect(result.createdFromVersion).toBe(3);
    expect(client.sduiScreen.updateMany).toHaveBeenCalledTimes(1);
  });

  it('starts published upsert history at version one when no prior version exists', async () => {
    client.sduiScreen.findFirst.mockResolvedValue(null);
    client.sduiScreen.create.mockImplementation(async ({ data }: any) => screenRecord({
      versionNumber: data.versionNumber,
      status: data.status,
      layoutJson: data.layoutJson,
      lockVersion: data.lockVersion,
      publishedAt: data.publishedAt,
      publishedBy: data.publishedBy,
      createdFromVersion: data.createdFromVersion,
      changeDescription: data.changeDescription,
    }));
    const result = await repository.upsertScreen('auth_login', 'CUSTOMER', validLayout);
    expect(result.versionNumber).toBe(1);
    expect(result.createdFromVersion).toBeNull();
  });

  it('updates an active draft through unpublished upsert', async () => {
    const draft = screenRecord({ lockVersion: 5, changeDescription: 'keep' });
    client.sduiScreen.findFirst.mockResolvedValueOnce(draft).mockResolvedValueOnce(draft);
    client.sduiScreen.update.mockResolvedValue(screenRecord({ lockVersion: 6, changeDescription: 'keep' }));
    const result = await repository.upsertScreen('auth_login', 'CUSTOMER', validLayout, false);
    expect(result.lockVersion).toBe(6);
  });

  it('creates a draft through unpublished upsert when none exists', async () => {
    client.sduiScreen.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(null).mockResolvedValueOnce(null);
    client.sduiScreen.create.mockImplementation(async ({ data }: any) => screenRecord({
      versionNumber: data.versionNumber,
      status: data.status,
      layoutJson: data.layoutJson,
      lockVersion: data.lockVersion,
      createdFromVersion: data.createdFromVersion,
      changeDescription: data.changeDescription,
    }));
    const result = await repository.upsertScreen('auth_login', 'CUSTOMER', validLayout, false);
    expect(result.status).toBe('DRAFT');
    expect(result.versionNumber).toBe(1);
  });

  it('rejects duplicate draft creation unless overwrite is enabled', async () => {
    client.sduiScreen.findFirst.mockResolvedValue(screenRecord());
    let error: unknown;
    try { await repository.createDraft({ screenId: 'auth_login', layoutJson: validLayout }); } catch (caught) { error = caught; }
    expectKernelError(error, KernelErrorCode.CONFLICT, 409);
    expect(client.sduiScreen.update).not.toHaveBeenCalled();
  });

  it('overwrites a draft and increments optimistic lock', async () => {
    client.sduiScreen.findFirst.mockResolvedValue(screenRecord({ lockVersion: 2, changeDescription: 'keep-me' }));
    client.sduiScreen.update.mockResolvedValue(screenRecord({ lockVersion: 3, changeDescription: 'keep-me' }));
    const result = await repository.createDraft({
      screenId: 'auth_login', layoutJson: validLayout, overwriteExistingDraft: true,
    });
    expect(result.lockVersion).toBe(3);
    expect(client.sduiScreen.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { layoutJson: validLayout, lockVersion: 3, changeDescription: 'keep-me' },
    });
  });

  it('creates a new draft after latest history and honors explicit ancestry', async () => {
    client.sduiScreen.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(screenRecord({ versionNumber: 7, status: 'ARCHIVED' }));
    client.sduiScreen.create.mockImplementation(async ({ data }: any) => screenRecord({
      versionNumber: data.versionNumber,
      status: data.status,
      layoutJson: data.layoutJson,
      lockVersion: data.lockVersion,
      createdFromVersion: data.createdFromVersion,
      changeDescription: data.changeDescription,
    }));
    const result = await repository.createDraft({
      screenId: 'auth_login', layoutJson: validLayout, createdFromVersion: 2, changeDescription: 'branch v2',
    });
    expect(result.versionNumber).toBe(8);
    expect(result.createdFromVersion).toBe(2);
    expect(result.changeDescription).toBe('branch v2');
  });

  it('uses latest history and default description for a new draft', async () => {
    client.sduiScreen.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(screenRecord({ versionNumber: 4, status: 'ARCHIVED' }));
    client.sduiScreen.create.mockImplementation(async ({ data }: any) => screenRecord({
      versionNumber: data.versionNumber,
      status: data.status,
      layoutJson: data.layoutJson,
      lockVersion: data.lockVersion,
      createdFromVersion: data.createdFromVersion,
      changeDescription: data.changeDescription,
    }));
    const result = await repository.createDraft({ screenId: 'auth_login', layoutJson: validLayout });
    expect(result.createdFromVersion).toBe(4);
    expect(result.changeDescription).toBe('Created draft');
  });

  it('rejects update when draft is missing or lock is stale', async () => {
    client.sduiScreen.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(screenRecord({ lockVersion: 4 }));
    await expect(repository.updateDraft({ screenId: 'auth_login', layoutJson: validLayout, lockVersion: 1 }))
      .rejects.toMatchObject({ code: KernelErrorCode.NOT_FOUND, statusCode: 404 });
    await expect(repository.updateDraft({ screenId: 'auth_login', layoutJson: validLayout, lockVersion: 3 }))
      .rejects.toMatchObject({ code: KernelErrorCode.CONFLICT, statusCode: 409 });
  });

  it('updates a matching draft lock and description', async () => {
    client.sduiScreen.findFirst.mockResolvedValue(screenRecord({ lockVersion: 4, changeDescription: 'old' }));
    client.sduiScreen.update.mockResolvedValue(screenRecord({ lockVersion: 5, changeDescription: 'new' }));
    const result = await repository.updateDraft({
      screenId: 'auth_login', layoutJson: validLayout, lockVersion: 4, changeDescription: 'new',
    });
    expect(result.lockVersion).toBe(5);
    expect(result.changeDescription).toBe('new');
  });

  it('rejects a missing publish target and returns an already published target unchanged', async () => {
    client.sduiScreen.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(screenRecord({ status: 'PUBLISHED' }));
    await expect(repository.publishVersion('auth_login', 'CUSTOMER', 9, 'admin'))
      .rejects.toMatchObject({ code: KernelErrorCode.NOT_FOUND, statusCode: 404 });
    const result = await repository.publishVersion('auth_login', 'CUSTOMER', 1, 'admin');
    expect(result.status).toBe('PUBLISHED');
    expect(client.sduiScreen.update).not.toHaveBeenCalled();
  });

  it('archives the prior publication and publishes a draft target', async () => {
    client.sduiScreen.findFirst.mockResolvedValue(screenRecord({ status: 'DRAFT', lockVersion: 2 }));
    client.sduiScreen.update.mockImplementation(async ({ data }: any) => screenRecord({
      status: data.status,
      lockVersion: data.lockVersion,
      publishedAt: data.publishedAt,
      publishedBy: data.publishedBy,
    }));
    const result = await repository.publishVersion('auth_login', 'CUSTOMER', 1, 'admin-2');
    expect(result.status).toBe('PUBLISHED');
    expect(result.lockVersion).toBe(3);
    expect(result.publishedBy).toBe('admin-2');
  });

  it('rejects missing/current publication archive and archives a draft version', async () => {
    client.sduiScreen.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(screenRecord({ status: 'PUBLISHED' }))
      .mockResolvedValueOnce(screenRecord({ status: 'DRAFT', lockVersion: 6 }));
    await expect(repository.archiveVersion('auth_login', 'CUSTOMER', 99))
      .rejects.toMatchObject({ code: KernelErrorCode.NOT_FOUND, statusCode: 404 });
    await expect(repository.archiveVersion('auth_login', 'CUSTOMER', 1))
      .rejects.toMatchObject({ code: KernelErrorCode.INVALID_INPUT, statusCode: 400 });
    client.sduiScreen.update.mockResolvedValue(screenRecord({ status: 'ARCHIVED', lockVersion: 7 }));
    const archived = await repository.archiveVersion('auth_login', 'CUSTOMER', 1);
    expect(archived.status).toBe('ARCHIVED');
    expect(archived.lockVersion).toBe(7);
  });

  it('rejects a missing rollback target', async () => {
    client.sduiScreen.findFirst.mockResolvedValue(null);
    await expect(repository.rollbackVersion('auth_login', 'CUSTOMER', 3, 'admin'))
      .rejects.toMatchObject({ code: KernelErrorCode.NOT_FOUND, statusCode: 404 });
  });

  it('creates a new published rollback version and the version-one fallback', async () => {
    client.sduiScreen.findFirst
      .mockResolvedValueOnce(screenRecord({ versionNumber: 2, status: 'ARCHIVED' }))
      .mockResolvedValueOnce(screenRecord({ versionNumber: 5, status: 'PUBLISHED' }));
    client.sduiScreen.create.mockImplementation(async ({ data }: any) => screenRecord({
      versionNumber: data.versionNumber,
      status: data.status,
      layoutJson: data.layoutJson,
      lockVersion: data.lockVersion,
      publishedAt: data.publishedAt,
      publishedBy: data.publishedBy,
      createdFromVersion: data.createdFromVersion,
      changeDescription: data.changeDescription,
    }));
    const rolled = await repository.rollbackVersion('auth_login', 'CUSTOMER', 2, 'admin-3');
    expect(rolled.versionNumber).toBe(6);
    expect(rolled.createdFromVersion).toBe(2);

    client.sduiScreen.findFirst
      .mockResolvedValueOnce(screenRecord({ versionNumber: 1, status: 'ARCHIVED' }))
      .mockResolvedValueOnce(null);
    const first = await repository.rollbackVersion('auth_login', 'CUSTOMER', 1, 'admin-1');
    expect(first.versionNumber).toBe(1);
  });

  it('maps history, specific version and draft lookups including null branches', async () => {
    client.sduiScreen.findMany.mockResolvedValue([
      screenRecord({ id: 2, versionNumber: 2, status: 'PUBLISHED' }),
      screenRecord({ id: 1, versionNumber: 1, status: 'ARCHIVED' }),
    ]);
    client.sduiScreen.findFirst
      .mockResolvedValueOnce(screenRecord({ versionNumber: 2, status: 'PUBLISHED' }))
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(screenRecord({ status: 'DRAFT' }))
      .mockResolvedValueOnce(null);
    expect((await repository.getVersionHistory('auth_login')).map((item) => item.versionNumber)).toEqual([2, 1]);
    expect((await repository.getSpecificVersion('auth_login', 'CUSTOMER', 2))?.versionNumber).toBe(2);
    await expect(repository.getSpecificVersion('auth_login', 'CUSTOMER', 99)).resolves.toBeNull();
    expect((await repository.findDraft('auth_login'))?.status).toBe('DRAFT');
    await expect(repository.findDraft('missing', 'PARTNER')).resolves.toBeNull();
  });

  it.each([
    ['COMPONENT', 'createComponent', 'getComponent', 'listComponents'],
    ['SECTION', 'createSection', 'getSection', 'listSections'],
    ['GROUP', 'createGroup', 'getGroup', 'listGroups'],
    ['ELEMENT', 'createElement', 'getElement', 'listElements'],
  ] as const)('maps %s create/get/list/null behavior', async (level, createMethod, getMethod, listMethod) => {
    const record = nodeRecord(level);
    client.sduiComponentRegistry.upsert.mockResolvedValue(record);
    client.sduiComponentRegistry.findFirst.mockResolvedValueOnce(record).mockResolvedValueOnce(null);
    client.sduiComponentRegistry.findMany.mockResolvedValue([record]);
    const input = {
      name: record.name,
      componentType: record.componentType,
      schemaJson: record.schemaJson,
      supportedProperties: record.supportedProperties,
      supportedActions: record.supportedActions,
    };
    expect((await (repository[createMethod] as any)(input)).nodeLevel).toBe(level);
    expect((await (repository[getMethod] as any)(record.name))?.nodeLevel).toBe(level);
    await expect((repository[getMethod] as any)('missing')).resolves.toBeNull();
    expect((await (repository[listMethod] as any)()).map((item: any) => item.nodeLevel)).toEqual([level]);
  });
});
