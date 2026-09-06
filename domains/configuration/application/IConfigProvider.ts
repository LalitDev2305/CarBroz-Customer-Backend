/** IConfigProvider is an exported domains/configuration contract/implementation; see the owning README for lifecycle and extension rules. */
export interface IConfigProvider {
  get<T>(key: string, defaultValue?: T): Promise<T>;
  has(key: string): Promise<boolean>;
  getAll(): Promise<Record<string, string>>;
}
