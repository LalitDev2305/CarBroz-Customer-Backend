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
  template: { id: 't1', type: 'auth', components: [] },
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

function nodeRecord(nodeLevel: string, overrides: Record<string, unknown> = {}) {
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
    ...overrides,
  };
}

function createClient() {
  const client: any = {
    sduiScreen: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    sduiTemplate: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    sduiComponentRegistry: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      upsert: vi.fn(),
    },
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

  it('maps the latest published screen and returns null when absent', async () => {
    client.sduiScreen.findFirst
      .mockResolvedValueOnce(screenRecord({ status: 'PUBLISHED', publishedAt: now, publishedBy: 'admin-1' }))
      .mockResolvedValueOnce(null);

    const published = await repository.findPublishedScreen('auth_login');
    expect(published?.status).toBe('PUBLISHED');
    expect(published?.targetApp).toBe('CUSTOMER');
    expect(published?.publishedBy).toBe('admin-1');
    expect(client.sduiScreen.findFirst).toHaveBeenNthCalledWith(1, {
      where: { screenId: 'auth_login', targetApp: 'CUSTOMER', status: 'PUBLISHED' },
      orderBy: { versionNumber: 'desc' },
    });
    await expect(repository.findPublishedScreen('missing', 'PARTNER')).resolves.toBeNull();
  });

  it('rejects unsupported persisted screen status while mapping', async () => {
    client.sduiScreen.findFirst.mockResolvedValue(screenRecord({ status: 'CORRUPT' }));
    await expect(repository.findPublishedScreen('auth_login')).rejects.toSatisfy((error: unknown) => {
      expectKernelError(error, KernelErrorCode.INVALID_INPUT, 400);
      return true;
    });
  });

  it('publishes a new upsert version transactionally and archives the previous publication', async () => {
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
    expect(client.sduiScreen.updateMany).toHaveBeenCalledWith({
      where: { screenId: 'auth_login', targetApp: 'CUSTOMER', status: 'PUBLISHED' },
      data: { status: 'ARCHIVED' },
    });
    expect(client.$transaction).toHaveBeenCalledTimes(1);
  });

  it('starts publication history at version one when no previous version exists', async () => {
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

  it('updates an existing draft through upsert using its optimistic lock', async () => {
    const draft = screenRecord({ lockVersion: 5 });
    client.sduiScreen.findFirst
      .mockResolvedValueOnce(draft)
      .mockResolvedValueOnce(draft);
    client.sduiScreen.update.mockResolvedValue(screenRecord({ lockVersion: 6, changeDescription: 'existing' }));

    const result = await repository.upsertScreen('auth_login', 'CUSTOMER', validLayout, false);
    expect(result.lockVersion).toBe(6);
    expect(client.sduiScreen.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 1 },
      data: expect.objectContaining({ lockVersion: 6 }),
    }));
  });

  it('creates a draft through upsert when no active draft exists', async () => {
    client.sduiScreen.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
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

  it('rejects duplicate draft creation unless overwrite is explicitly enabled', async () => {
    client.sduiScreen.findFirst.mockResolvedValue(screenRecord({ status: 'DRAFT' }));

    let error: unknown;
    try {
      await repository.createDraft({ screenId: 'auth_login', targetApp: 'CUSTOMER', layoutJson: validLayout });
    } catch (caught) {
      error = caught;
    }
    expectKernelError(error, KernelErrorCode.CONFLICT, 409);
    expect(client.sduiScreen.update).not.toHaveBeenCalled();
  });

  it('overwrites an existing draft, increments lock version and preserves description by default', async () => {
    client.sduiScreen.findFirst.mockResolvedValue(screenRecord({ lockVersion: 2, changeDescription: 'keep-me' }));
    client.sduiScreen.update.mockResolvedValue(screenRecord({ lockVersion: 3, changeDescription: 'keep-me' }));

    const result = await repository.createDraft({
      screenId: 'auth_login',
      targetApp: 'CUSTOMER',
      layoutJson: validLayout,
      overwriteExistingDraft: true,
    });
    expect(result.lockVersion).toBe(3);
    expect(client.sduiScreen.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { layoutJson: validLayout, lockVersion: 3, changeDescription: 'keep-me' },
    });
  });

  it('creates a new draft after the latest version and honors explicit ancestry/description', async () => {
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
      screenId: 'auth_login',
      layoutJson: validLayout,
      createdFromVersion: 2,
      changeDescription: 'branch from v2',
    });
    expect(result.versionNumber).toBe(8);
    expect(result.createdFromVersion).toBe(2);
    expect(result.changeDescription).toBe('branch from v2');
  });

  it('uses latest version as draft ancestry and default description when explicit values are absent', async () => {
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

  it('rejects update when no draft exists', async () => {
    client.sduiScreen.findFirst.mockResolvedValue(null);
    let error: unknown;
    try {
      await repository.updateDraft({ screenId: 'auth_login', layoutJson: validLayout, lockVersion: 1 });
    } catch (caught) {
      error = caught;
    }
    expectKernelError(error, KernelErrorCode.NOT_FOUND, 404);
  });

  it('rejects stale optimistic lock updates and performs no write', async () => {
    client.sduiScreen.findFirst.mockResolvedValue(screenRecord({ lockVersion: 4 }));
    let error: unknown;
    try {
      await repository.updateDraft({ screenId: 'auth_login', layoutJson: validLayout, lockVersion: 3 });
    } catch (caught) {
      error = caught;
    }
    expectKernelError(error, KernelErrorCode.CONFLICT, 409);
    expect(client.sduiScreen.update).not.toHaveBeenCalled();
  });

  it('updates a matching draft lock and overrides change description when supplied', async () => {
    client.sduiScreen.findFirst.mockResolvedValue(screenRecord({ lockVersion: 4, changeDescription: 'old' }));
    client.sduiScreen.update.mockResolvedValue(screenRecord({ lockVersion: 5, changeDescription: 'new' }));

    const result = await repository.updateDraft({
      screenId: 'auth_login',
      targetApp: 'CUSTOMER',
      layoutJson: validLayout,
      lockVersion: 4,
      changeDescription: 'new',
    });
    expect(result.lockVersion).toBe(5);
    expect(result.changeDescription).toBe('new');
  });

  it('rejects publishing a version that does not exist', async () => {
    client.sduiScreen.findFirst.mockResolvedValue(null);
    let error: unknown;
    try {
      await repository.publishVersion('auth_login', 'CUSTOMER', 9, 'admin-1');
    } catch (caught) {
      error = caught;
    }
    expectKernelError(error, KernelErrorCode.NOT_FOUND, 404);
  });

  it('returns an already-published version without redundant writes', async () => {
    client.sduiScreen.findFirst.mockResolvedValue(screenRecord({ status: 'PUBLISHED' }));
    const result = await repository.publishVersion('auth_login', 'CUSTOMER', 1, 'admin-1');
    expect(result.status).toBe('PUBLISHED');
    expect(client.sduiScreen.updateMany).not.toHaveBeenCalled();
    expect(client.sduiScreen.update).not.toHaveBeenCalled();
  });

  it('archives previous publication and publishes the requested draft', async () => {
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
    expect(client.sduiScreen.updateMany).toHaveBeenCalledTimes(1);
  });

  it('rejects archiving a missing or currently published version', async () => {
    client.sduiScreen.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(screenRecord({ status: 'PUBLISHED' }));

    await expect(repository.archiveVersion('auth_login', 'CUSTOMER', 99)).rejects.toMatchObject({
      code: KernelErrorCode.NOT_FOUND,
      statusCode: 404,
    });
    await expect(repository.archiveVersion('auth_login', 'CUSTOMER', 1)).rejects.toMatchObject({
      code: KernelErrorCode.INVALID_INPUT,
      statusCode: 400,
    });
  });

  it('archives a non-published version and increments its lock', async () => {
    client.sduiScreen.findFirst.mockResolvedValue(screenRecord({ status: 'DRAFT', lockVersion: 6 }));
    client.sduiScreen.update.mockResolvedValue(screenRecord({ status: 'ARCHIVED', lockVersion: 7 }));
    const result = await repository.archiveVersion('auth_login', 'CUSTOMER', 1);
    expect(result.status).toBe('ARCHIVED');
    expect(result.lockVersion).toBe(7);
  });

  it('rejects rollback when the target history version is missing', async () => {
    client.sduiScreen.findFirst.mockResolvedValue(null);
    await expect(repository.rollbackVersion('auth_login', 'CUSTOMER', 3, 'admin-1')).rejects.toMatchObject({
      code: KernelErrorCode.NOT_FOUND,
      statusCode: 404,
    });
  });

  it('creates a new published rollback version from canonical historical layout', async () => {
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

    const result = await repository.rollbackVersion('auth_login', 'CUSTOMER', 2, 'admin-3');
    expect(result.versionNumber).toBe(6);
    expect(result.status).toBe('PUBLISHED');
    expect(result.createdFromVersion).toBe(2);
    expect(result.changeDescription).toBe('Rollback to version 2');
  });

  it('starts rollback publication at version one if no later version exists', async () => {
    client.sduiScreen.findFirst
      .mockResolvedValueOnce(screenRecord({ versionNumber: 1, status: 'ARCHIVED' }))
      .mockResolvedValueOnce(null);
    client.sduiScreen.create.mockImplementation(async ({ data }: any) => screenRecord({
      versionNumber: data.versionNumber,
      status: data.status,
      layoutJson: data.layoutJson,
      lockVersion: data.lockVersion,
      createdFromVersion: data.createdFromVersion,
      changeDescription: data.changeDescription,
    }));
    const result = await repository.rollbackVersion('auth_login', 'CUSTOMER', 1, 'admin-1');
    expect(result.versionNumber).toBe(1);
  });

  it('maps version history, specific-version, and draft lookup including null branches', async () => {
    client.sduiScreen.findMany.mockResolvedValue([
      screenRecord({ id: 2, versionNumber: 2, status: 'PUBLISHED' }),
      screenRecord({ id: 1, versionNumber: 1, status: 'ARCHIVED' }),
    ]);
    client.sduiScreen.findFirst
      .mockResolvedValueOnce(screenRecord({ versionNumber: 2, status: 'PUBLISHED' }))
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(screenRecord({ status: 'DRAFT' }))
      .mockResolvedValueOnce(null);

    const history = await repository.getVersionHistory('auth_login');
    expect(history.map((item) => item.versionNumber)).toEqual([2, 1]);
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
  ] as const)('maps %s registry node create/get/list/null behavior', async (level, createMethod, getMethod, listMethod) => {
    const record = nodeRecord(level);
    client.sduiComponentRegistry.upsert.mockResolvedValue(record);
    client.sduiComponentRegistry.findFirst
      .mockResolvedValueOnce(record)
      .mockResolvedValueOnce(null);
    client.sduiComponentRegistry.findMany.mockResolvedValue([record]);

    const input = {
      name: record.name,
      componentType: record.componentType,
      schemaJson: record.schemaJson,
      supportedProperties: record.supportedProperties,
      supportedActions: record.supportedActions,
    };
    const created = await (repository[createMethod] as any)(input);
    expect(created.nodeLevel).toBe(level);
    expect((await (repository[getMethod] as any)(record.name))?.nodeLevel).toBe(level);
    await expect((repository[getMethod] as any)('missing')).resolves.toBeNull();
    expect((await (repository[listMethod] as any)()).map((item: any) => item.nodeLevel)).toEqual([level]);
    expect(client.sduiComponentRegistry.upsert).toHaveBeenCalledWith({
      where: { name: record.name },
      update: expect.objectContaining({ nodeLevel: level }),
      create: expect.objectContaining({ nodeLevel: level }),
    });
  });
});
