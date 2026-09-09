export abstract class TypedPropertyBuilder<P extends object> {
  private readonly values: Partial<P> = {};

  configure(properties: Partial<P>): this {
    Object.assign(this.values, properties);
    return this;
  }

  protected setProperty<K extends keyof P>(key: K, value: P[K]): this {
    this.values[key] = value;
    return this;
  }

  protected propertiesSnapshot(): Record<string, unknown> {
    return { ...this.values } as Record<string, unknown>;
  }
}
