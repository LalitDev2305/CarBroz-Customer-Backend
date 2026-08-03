import { IProvider } from './IProvider.js';
export interface IConfigProvider extends IProvider {
    get<T>(key: string, defaultValue?: T): Promise<T>;
    has(key: string): Promise<boolean>;
    getAll(): Promise<Record<string, string>>;
}
