import type { IRepository } from '@carbroz/foundation-kernel';
import type { SystemConfig } from '../SystemConfig.js';

export interface IConfigRepository extends IRepository<SystemConfig, number> {
  findByKey(key: string): Promise<SystemConfig | null>;
  findAllConfig(): Promise<SystemConfig[]>;
}
