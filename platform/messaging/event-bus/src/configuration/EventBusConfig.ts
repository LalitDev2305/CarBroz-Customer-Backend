/** EventBusConfig is an exported platform/messaging contract/implementation; see the owning README for lifecycle and extension rules. */
export interface EventBusConfig {
  maxListeners?: number;
  asyncDispatch?: boolean;
}
