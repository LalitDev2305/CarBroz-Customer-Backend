import { IRepository } from '../IRepository.js';
import { SystemConfig } from '../SystemConfig.js';

export interface IConfigRepository extends IRepository<SystemConfig, number> {
  findByKey(key: string): Promise<SystemConfig | null>;
  findAllConfig(): Promise<SystemConfig[]>;
}
