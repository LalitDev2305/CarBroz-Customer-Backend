/** QueueConfig is an exported platform/messaging contract/implementation; see the owning README for lifecycle and extension rules. */
export interface QueueConfig {
  redisHost?: string;
  redisPort?: number;
  prefix?: string;
  defaultAttempts?: number;
  defaultBackoffDelay?: number;
}
