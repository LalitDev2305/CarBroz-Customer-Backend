/** Stable actor kinds understood across bounded contexts. */
export type ActorKind = 'GUEST' | 'CUSTOMER' | 'PARTNER' | 'ADMIN' | 'SYSTEM';

/**
 * Minimal authenticated actor identity that application services may use for authorization.
 *
 * HTTP requests, headers, tokens and framework-specific user objects are intentionally excluded.
 */
export interface ActorIdentity {
  readonly id: string | number;
  readonly kind: ActorKind;
  readonly roles: readonly string[];
  readonly customerId?: number;
  readonly partnerId?: number;
  readonly tenantId?: string;
}

/**
 * Transport-neutral execution metadata propagated across application boundaries.
 * Correlation IDs connect logs/traces without leaking transport objects into business code.
 */
export interface ExecutionContext {
  readonly correlationId: string;
  readonly actor?: ActorIdentity;
  readonly timestamp: Date;
}

/** Universal application command/query contract. */
export interface IUseCase<TInput, TOutput> {
  execute(input: TInput, context?: ExecutionContext): Promise<TOutput>;
}

/** Opaque transaction token; only the database adapter knows its concrete vendor type. */
export type TransactionContext = unknown;

/** Universal unit-of-work boundary for application services requiring atomic persistence. */
export interface ITransactionProvider {
  runInTransaction<T>(work: (transaction?: TransactionContext) => Promise<T>): Promise<T>;
}

/** Time source abstraction for deterministic domain/application testing. */
export interface IClockProvider {
  now(): Date;
}

/** Identifier source abstraction for deterministic domain/application testing. */
export interface IIdGeneratorProvider {
  generate(): string;
}
