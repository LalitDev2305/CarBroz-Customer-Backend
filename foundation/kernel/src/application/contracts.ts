/** Stable actor kinds understood across bounded contexts. */
export type ActorKind = "GUEST" | "CUSTOMER" | "PARTNER" | "ADMIN" | "SYSTEM";

/** Transport-neutral authenticated actor identity. */
export interface ActorContext {
  readonly id: number;
  readonly kind: ActorKind;
  readonly roles: readonly string[];
  readonly customerId?: number;
  readonly partnerId?: number;
  readonly tenantId?: string;
}

/** Transport-neutral execution metadata propagated across application boundaries. */
export interface ExecutionContext {
  readonly correlationId: string;
  readonly actor: ActorContext;
  readonly timestamp: Date;
}

export interface IUseCase<TInput, TOutput> {
  execute(input: TInput, context: ExecutionContext): Promise<TOutput>;
}

/** Opaque transaction-bound resource. Only infrastructure adapters may unwrap resource. */
export interface TransactionContext {
  readonly resource: object;
}

export interface ITransactionProvider {
  runInTransaction<T>(
    work: (transaction: TransactionContext) => Promise<T>,
  ): Promise<T>;
}

export interface IClockProvider {
  now(): Date;
}
export interface IIdGeneratorProvider {
  generate(): string;
}
