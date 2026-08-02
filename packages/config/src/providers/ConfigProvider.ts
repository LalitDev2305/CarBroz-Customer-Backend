import { IConfigProvider, IConfigRepository } from '@carbroz/common';

export class ConfigProvider implements IConfigProvider {
  private repository: IConfigRepository;

  constructor(configRepository: IConfigRepository) {
    this.repository = configRepository;
  }

  public async get<T>(key: string, defaultValue?: T): Promise<T> {
    const config = await this.repository.findByKey(key);
    if (!config) {
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      throw new Error(`Configuration key not found: ${key}`);
    }
    
    try {
      return JSON.parse(config.value) as T;
    } catch {
      return config.value as unknown as T;
    }
  }

  public async has(key: string): Promise<boolean> {
    const config = await this.repository.findByKey(key);
    return config !== null;
  }

  public async getAll(): Promise<Record<string, string>> {
    const configs = await this.repository.findAllConfig();
    const result: Record<string, string> = {};
    for (const config of configs) {
      result[config.key] = config.value;
    }
    return result;
  }
}
