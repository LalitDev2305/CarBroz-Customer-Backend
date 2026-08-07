import { IConfigProvider } from '@carbroz/foundation-kernel';
export declare class ConfigProvider implements IConfigProvider {
    private repository;
    constructor(configRepository: any);
    get<T>(key: string, defaultValue?: T): Promise<T>;
    has(key: string): Promise<boolean>;
    getAll(): Promise<Record<string, string>>;
}
