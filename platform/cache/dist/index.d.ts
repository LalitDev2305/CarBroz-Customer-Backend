export interface IProvider {
    initialize?(): Promise<void>;
    shutdown?(): Promise<void>;
}
export interface ICacheProvider extends IProvider {
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
    delete(key: string): Promise<void>;
    clear(): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map