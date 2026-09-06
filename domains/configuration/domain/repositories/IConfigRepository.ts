import type { IRepository } from '@carbroz/foundation-kernel';
import type { SystemConfig } from '../SystemConfig.js';

/** IConfigRepository is an exported domains/configuration contract/implementation; see the owning README for lifecycle and extension rules. */
export interface IConfigRepository extends IRepository<SystemConfig, number> {
  findByKey(key: string): Promise<SystemConfig | null>;
  findAllConfig(): Promise<SystemConfig[]>;
}
