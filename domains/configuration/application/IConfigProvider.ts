export interface IConfigProvider {
  get<T>(key: string, defaultValue?: T): Promise<T>;
  has(key: string): Promise<boolean>;
  getAll(): Promise<Record<string, string>>;
}
