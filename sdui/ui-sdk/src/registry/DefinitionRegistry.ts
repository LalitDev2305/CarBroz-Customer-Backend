export type DefinitionFactory<TInput, TOutput> = (input: TInput) => TOutput;

/**
 * Stores reusable SDUI definition factories by canonical type.
 *
 * @remarks
 * **Owner:** `@carbroz/ui-sdk`.
 *
 * This registry is an in-memory composition mechanism used by the UI SDK's
 * factories. It is intentionally different from the workspace package
 * `@carbroz/sdui-registry`, which owns draft/publish/version persistence and
 * lifecycle behavior.
 *
 * A registration describes reusable structure/semantics. Each {@link create}
 * call produces a fresh runtime instance from caller-supplied input.
 *
 * Invariants:
 * - definition type keys must be non-empty;
 * - a canonical type may be registered only once;
 * - unknown definitions fail fast instead of silently falling back;
 * - this class remains product-neutral and must not depend on Partner,
 *   Customer, Admin or any other CarBroz business bounded context.
 *
 * Extension model:
 * callers add a new definition by registering a new type/factory. Existing
 * unrelated definitions and factory implementations do not need modification.
 */
export class DefinitionRegistry<TInput, TOutput> {
  private readonly definitions = new Map<string, DefinitionFactory<TInput, TOutput>>();

  /**
   * Registers one canonical reusable SDUI definition factory.
   *
   * @param type - Stable canonical definition type used by factories/builders.
   * @param factory - Pure definition factory that creates a runtime instance.
   * @throws Error when the type is blank or already registered.
   */
  register(type: string, factory: DefinitionFactory<TInput, TOutput>): void {
    const key = type.trim();
    if (!key) throw new Error('SDUI definition type must not be empty');
    if (this.definitions.has(key)) throw new Error(`SDUI definition '${key}' is already registered`);
    this.definitions.set(key, factory);
  }

  /**
   * Reports whether a canonical definition type is registered.
   *
   * @param type - Canonical definition type.
   */
  has(type: string): boolean {
    return this.definitions.has(type);
  }

  /**
   * Creates a new runtime instance from a registered reusable definition.
   *
   * @param type - Canonical registered definition type.
   * @param input - Runtime instance data supplied by the caller.
   * @returns A newly created runtime instance.
   * @throws Error when the requested definition is unknown.
   */
  create(type: string, input: TInput): TOutput {
    const factory = this.definitions.get(type);
    if (!factory) throw new Error(`SDUI definition '${type}' is not registered`);
    return factory(input);
  }

  /**
   * Returns an immutable snapshot of the currently registered canonical types.
   *
   * @remarks
   * The returned array is detached from the internal map so consumers cannot
   * mutate registry ownership accidentally.
   */
  types(): readonly string[] {
    return Object.freeze([...this.definitions.keys()]);
  }
}
