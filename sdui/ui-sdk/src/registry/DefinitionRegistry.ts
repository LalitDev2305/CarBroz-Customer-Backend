export type DefinitionFactory<TInput, TOutput> = (input: TInput) => TOutput;

/**
 * Registry of immutable reusable SDUI definitions keyed by their canonical type.
 * A registration describes structure/semantics; each create call produces a new instance.
 */
export class DefinitionRegistry<TInput, TOutput> {
  private readonly definitions = new Map<string, DefinitionFactory<TInput, TOutput>>();

  register(type: string, factory: DefinitionFactory<TInput, TOutput>): void {
    const key = type.trim();
    if (!key) throw new Error('SDUI definition type must not be empty');
    if (this.definitions.has(key)) throw new Error(`SDUI definition '${key}' is already registered`);
    this.definitions.set(key, factory);
  }

  has(type: string): boolean {
    return this.definitions.has(type);
  }

  create(type: string, input: TInput): TOutput {
    const factory = this.definitions.get(type);
    if (!factory) throw new Error(`SDUI definition '${type}' is not registered`);
    return factory(input);
  }

  types(): readonly string[] {
    return Object.freeze([...this.definitions.keys()]);
  }
}
