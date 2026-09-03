import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const p = (...parts) => path.join(root, ...parts);
const write = (relative, content) => {
  const file = p(relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
};
const patch = (relative, transform) => {
  const file = p(relative);
  if (!fs.existsSync(file)) return;
  const before = fs.readFileSync(file, 'utf8');
  const after = transform(before);
  if (after !== before) fs.writeFileSync(file, after);
};

// Configuration owns its application input. API/Zod schemas remain transport-only.
patch('domains/configuration/application/GetInitConfigUseCase.ts', (text) => {
  text = text.replace(/^import .*GetInitConfigDto.*config\.dto\.js.*\n/m, '');
  text = text.replace(/GetInitConfigDto/g, 'GetInitConfigInput');
  if (!text.includes('export interface GetInitConfigInput')) {
    const marker = 'export interface InitConfigResponse';
    text = text.replace(marker, `export interface GetInitConfigInput {\n  appVersion?: string;\n  platform?: 'IOS' | 'ANDROID';\n}\n\n${marker}`);
  }
  return text;
});

// Repository-specific persistence contract owned by Configuration. This keeps
// Configuration independent of the concrete platform/database PrismaProvider.
write('domains/configuration/infrastructure/persistence/FeatureFlagPersistenceClient.ts', `export interface FeatureFlagPersistenceRecord {
  id: number;
  publicId: string;
  key: string;
  enabled: boolean;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface FeatureFlagPersistenceClient {
  featureFlag: {
    findUnique(args: { where: { id?: number; key?: string; deletedAt?: null } }): Promise<FeatureFlagPersistenceRecord | null>;
    findMany(args?: { where?: { deletedAt?: null } }): Promise<FeatureFlagPersistenceRecord[]>;
    create(args: { data: Record<string, unknown> }): Promise<FeatureFlagPersistenceRecord>;
    update(args: { where: { id: number }; data: Record<string, unknown> }): Promise<FeatureFlagPersistenceRecord>;
  };
}
`);

write('domains/configuration/infrastructure/repositories/PrismaFeatureFlagRepository.ts', `import type { FeatureFlag, IFeatureFlagRepository } from '@carbroz/common';
import type {
  FeatureFlagPersistenceClient,
  FeatureFlagPersistenceRecord,
} from '../persistence/FeatureFlagPersistenceClient.js';

export class PrismaFeatureFlagRepository implements IFeatureFlagRepository {
  constructor(private readonly prisma: FeatureFlagPersistenceClient) {}

  private mapToDomain(model: FeatureFlagPersistenceRecord): FeatureFlag {
    return {
      id: model.id,
      publicId: model.publicId,
      key: model.key,
      enabled: model.enabled,
      description: model.description,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      deletedAt: model.deletedAt,
    };
  }

  async findById(id: number): Promise<FeatureFlag | null> {
    const model = await this.prisma.featureFlag.findUnique({ where: { id } });
    return model ? this.mapToDomain(model) : null;
  }

  async findByKey(key: string): Promise<FeatureFlag | null> {
    const model = await this.prisma.featureFlag.findUnique({ where: { key, deletedAt: null } });
    return model ? this.mapToDomain(model) : null;
  }

  async findAll(): Promise<FeatureFlag[]> {
    const models = await this.prisma.featureFlag.findMany({ where: { deletedAt: null } });
    return models.map((model) => this.mapToDomain(model));
  }

  async findAllFlags(): Promise<FeatureFlag[]> {
    return this.findAll();
  }

  async save(entity: FeatureFlag): Promise<FeatureFlag> {
    const model = await this.prisma.featureFlag.update({
      where: { id: entity.id },
      data: {
        key: entity.key,
        enabled: entity.enabled,
        description: entity.description ?? null,
        deletedAt: entity.deletedAt ?? null,
      },
    });
    return this.mapToDomain(model);
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.featureFlag.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
      return true;
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025') {
        return false;
      }
      throw error;
    }
  }
}
`);

console.log('Backend V3 Configuration bounded context finalized.');
