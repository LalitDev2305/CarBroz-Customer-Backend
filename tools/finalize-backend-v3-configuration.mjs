import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const p = (...parts) => path.join(root, ...parts);
const write = (relative, content) => {
  const file = p(relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
};

// Configuration application owns its input contract. API/Zod schemas stay at
// the transport edge and map structurally into this input.
write('domains/configuration/application/GetInitConfigUseCase.ts', `import type { IUseCase } from '@carbroz/foundation-kernel';
import type { IFeatureFlagRepository } from '../domain/repositories/IFeatureFlagRepository.js';

export interface GetInitConfigInput {
  appVersion?: string;
  platform?: 'IOS' | 'ANDROID';
}

export interface InitConfigResponse {
  maintenanceMode: boolean;
  minSupportedVersion: string;
  latestVersion: string;
  forceUpdate: boolean;
  features: Record<string, boolean>;
  contentVersions: Record<string, string>;
}

export class GetInitConfigUseCase implements IUseCase<GetInitConfigInput, InitConfigResponse> {
  constructor(private readonly featureFlagRepository: IFeatureFlagRepository) {}

  async execute(_request: GetInitConfigInput): Promise<InitConfigResponse> {
    const flags = await this.featureFlagRepository.findAll();
    const features = flags.reduce((acc, flag) => {
      acc[flag.key] = flag.enabled;
      return acc;
    }, {} as Record<string, boolean>);

    return {
      maintenanceMode: features['maintenance_mode'] ?? false,
      minSupportedVersion: '1.0.0',
      latestVersion: '1.0.0',
      forceUpdate: false,
      features,
      contentVersions: {
        sdui: 'v1',
        catalog: 'v1',
      },
    };
  }
}
`);

// Configuration owns a narrow persistence provider contract. The concrete
// platform PrismaProvider satisfies this structurally at composition time; the
// domain package never imports platform/database.
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
    update(args: { where: { id: number }; data: Record<string, unknown> }): Promise<FeatureFlagPersistenceRecord>;
  };
}

export interface FeatureFlagPersistenceProvider {
  getClient(): FeatureFlagPersistenceClient;
}
`);

write('domains/configuration/infrastructure/repositories/PrismaFeatureFlagRepository.ts', `import type { FeatureFlag } from '../../domain/FeatureFlag.js';
import type { IFeatureFlagRepository } from '../../domain/repositories/IFeatureFlagRepository.js';
import type {
  FeatureFlagPersistenceProvider,
  FeatureFlagPersistenceRecord,
} from '../persistence/FeatureFlagPersistenceClient.js';

export class PrismaFeatureFlagRepository implements IFeatureFlagRepository {
  constructor(private readonly prismaProvider: FeatureFlagPersistenceProvider) {}

  private get prisma() {
    return this.prismaProvider.getClient();
  }

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
      await this.prisma.featureFlag.update({ where: { id }, data: { deletedAt: new Date() } });
      return true;
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025') return false;
      throw error;
    }
  }
}
`);

console.log('Backend V3 Configuration bounded context finalized.');
