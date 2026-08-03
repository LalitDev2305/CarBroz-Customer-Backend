import { IConfigProvider, IConfigRepository } from '@carbroz/common';
export declare class ConfigProvider implements IConfigProvider {
    private repository;
    constructor(configRepository: IConfigRepository);
    get<T>(key: string, defaultValue?: T): Promise<T>;
    has(key: string): Promise<boolean>;
    getAll(): Promise<Record<string, string>>;
}
