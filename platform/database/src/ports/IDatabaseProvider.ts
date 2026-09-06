
/** IDatabaseProvider is an exported platform/database contract/implementation; see the owning README for lifecycle and extension rules. */
export interface IDatabaseProvider {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  health(): Promise<boolean>;
}
