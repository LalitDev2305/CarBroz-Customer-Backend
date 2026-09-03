import type { IConfigProvider, IConfigRepository } from '@carbroz/common';

export class ConfigProvider implements IConfigProvider {
  constructor(private readonly configRepository: IConfigRepository) {}

  public async get<T>(key: string, defaultValue?: T): Promise<T> {
    const config = await this.configRepository.findByKey(key);
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
    return (await this.configRepository.findByKey(key)) !== null;
  }

  public async getAll(): Promise<Record<string, string>> {
    const configs = await this.configRepository.findAllConfig();
    return Object.fromEntries(configs.map((config) => [config.key, config.value]));
  }
}
